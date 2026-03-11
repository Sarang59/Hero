<script setup>
import { ref, onMounted, nextTick } from 'vue'
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getStorage, ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage'
import FloatingControls from '@/components/FloatingControls.vue'
import SafeContent from '@/components/SafeContent.vue'

const db = getFirestore()
const userId = localStorage.getItem('userId')
const storage = getStorage()

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY

const contentLoading = ref(true)
const mapLoading = ref({})

const actionMessage = ref('')
const showMessage = ref(false)

// List of experts fetched from Firestore
const wellnessExperts = ref([])
const selectedFile = ref(null)

// Flag to check if current user is Admin
const isAdmin = ref(false)

// Show form
const showForm = ref(false)

// Mode: 'add' or 'edit'
const formMode = ref('add')

// Model for adding or editing an expert
const newExpert = ref({
  Name: '',
  Qualification: '',
  Specialisation: '',
  PhotoLink: '',
  PhoneNumber: '',
  Email: '',
  Experience: '',
  Location: '',
  Profession: '',
  Clinic: '',
})

// Appointment form model
const appointment = ref({
  Date: '',
  Time: '',
})

const loading = ref(false)

// toggles between experts and booking form
const showBookingForm = ref(false)

// For toggling maps
const showMap = ref({}) // track which expert card is showing map

// holds the selected expert for booking
const selectedExpert = ref(null)

// Validation errors
const errors = ref({})

const showConfirmation = (msg) => {
  actionMessage.value = msg
  showMessage.value = true

  // Hide automatically after 3 seconds
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

// Fetch current user role
const fetchUserRole = async () => {
  if (!userId) return

  const userDoc = await getDocs(collection(db, 'Users'))
  userDoc.forEach((doc) => {
    const data = doc.data()
    // if(doc.id === userId) isAdmin.value = data.Role === "Admin";
  })
}

// Fetch wellness experts
const fetchExperts = async () => {
  contentLoading.value = true
  try {
    const snapshot = await getDocs(collection(db, 'WellnessExperts'))

    // Load all experts first
    const experts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Now fetch their photo URLs (if they have one)
    for (const expert of experts) {
      if (expert.PhotoLink) {
        try {
          const imageRef = storageRef(storage, expert.PhotoLink)

          expert.PhotoURL = await getDownloadURL(imageRef)
        } catch (err) {
          console.warn(`Error loading image for ${expert.Name}:`, err)
          expert.PhotoURL = 'https://via.placeholder.com/400x200?text=No+Image' // fallback
        }
      } else {
        expert.PhotoURL = 'https://via.placeholder.com/400x200?text=No+Image'
      }
    }

    wellnessExperts.value = experts
  } catch (err) {
    console.error('Error fetching experts:', err)
  } finally {
    contentLoading.value = false
  }
}

// Add or update expert
const saveExpert = async () => {
  // Validate but skip PhotoLink for new experts
  errors.value = {}
  if (!newExpert.value.Name) errors.value.Name = 'Name is required'
  if (!newExpert.value.Qualification) errors.value.Qualification = 'Qualification is required'
  if (!newExpert.value.Specialisation) errors.value.Specialisation = 'Specialisation is required'
  if (!newExpert.value.PhoneNumber) errors.value.PhoneNumber = 'Phone number is required'
  if (!newExpert.value.Email) errors.value.Email = 'Email is required'
  if (!newExpert.value.Experience) errors.value.Experience = 'Experience is required'
  if (!newExpert.value.Location) errors.value.Location = 'Location is required'
  if (!newExpert.value.Profession) errors.value.Profession = 'Profession is required'
  if (!newExpert.value.Clinic) errors.value.Clinic = 'Clinic is required'

  // Only require photo for new experts if no file is selected
  if (!newExpert.value.id && !selectedFile.value && !newExpert.value.PhotoLink) {
    errors.value.PhotoLink = 'Photo is required for new expert'
  }

  if (Object.keys(errors.value).length > 0) return

  loading.value = true

  try {
    // Use existing PhotoLink or empty string
    let photoFileName = newExpert.value.PhotoLink || ''

    // If user uploaded a new image
    if (selectedFile.value) {
      const file = selectedFile.value
      const fileExt = file.name.split('.').pop()
      const baseName = `Image_${Date.now()}_${newExpert.value.Name.replace(/\s+/g, '_')}`
      photoFileName = `${baseName}.${fileExt}`

      const imageRef = storageRef(storage, photoFileName)
      await uploadBytes(imageRef, file)
    }

    if (newExpert.value.id) {
      // Update existing expert
      const docRef = doc(db, 'WellnessExperts', newExpert.value.id)
      await updateDoc(docRef, {
        Name: newExpert.value.Name || '',
        Qualification: newExpert.value.Qualification || '',
        Specialisation: newExpert.value.Specialisation || '',
        PhotoLink: photoFileName || newExpert.value.PhotoLink || '',
        PhoneNumber: newExpert.value.PhoneNumber || '',
        Email: newExpert.value.Email || '',
        Experience: newExpert.value.Experience || '',
        Location: newExpert.value.Location || '',
        Profession: newExpert.value.Profession || '',
        Clinic: newExpert.value.Clinic || '',
      })
      showConfirmation('Expert updated successfully!')
    } else {
      // Add new expert
      await addDoc(collection(db, 'WellnessExperts'), {
        Name: newExpert.value.Name || '',
        Qualification: newExpert.value.Qualification || '',
        Specialisation: newExpert.value.Specialisation || '',
        PhotoLink: photoFileName || '',
        PhoneNumber: newExpert.value.PhoneNumber || '',
        Email: newExpert.value.Email || '',
        Experience: newExpert.value.Experience || '',
        Location: newExpert.value.Location || '',
        Profession: newExpert.value.Profession || '',
        Clinic: newExpert.value.Clinic || '',
        CreatedAt: new Date(),
      })
      showConfirmation('Expert added successfully!')
    }

    // Refresh the list
    await fetchExperts()

    // Reset the form and hide it
    resetForm()
    showForm.value = false
    selectedFile.value = null
  } catch (err) {
    console.error('Error saving expert:', err)
    alert('Error saving expert: ' + err.message)
  } finally {
    loading.value = false
  }
}

const onFileChange = (e) => {
  selectedFile.value = e.target.files[0] || null
}

// Book appointment (for users)
const bookAppointment = (expert) => {
  selectedExpert.value = expert
  showBookingForm.value = true
  appointment.value = { Date: '', Time: '' }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Save appointment to Firestore
const confirmAppointment = async () => {
  if (!appointment.value.Date || !appointment.value.Time) {
    alert('Please select both date and time.')
    return
  }

  // Combine selected date and time into a single Date object
  const selectedDateTime = new Date(`${appointment.value.Date}T${appointment.value.Time}`)
  const now = new Date()

  // Validate that the selected date/time is not in the past
  if (selectedDateTime < now) {
    alert('You cannot select a past date or time for the appointment.')
    return
  }

  // Validate we have an expert selected
  if (!selectedExpert.value || !selectedExpert.value.id) {
    alert('No expert selected. Please select an expert first.')
    return
  }

  try {
    const startDateTime = new Date(`${appointment.value.Date}T${appointment.value.Time}`)
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000) // 30 min slot

    // Check for overlapping appointments
    const appointmentsRef = collection(db, 'Appointments')
    const q = query(
      appointmentsRef,
      where('ExpertId', '==', selectedExpert.value.id),
      where('Date', '==', appointment.value.Date),
      where('Time', '==', appointment.value.Time),
    )

    const querySnapshot = await getDocs(q)

    // Check if any existing appointments overlap with the selected time
    for (const doc of querySnapshot.docs) {
      const appt = doc.data()
      const apptStart = new Date(`${appt.Date}T${appt.Time}`)
      const apptEnd = new Date(apptStart.getTime() + 30 * 60 * 1000)

      // Check for overlap
      if (
        (startDateTime >= apptStart && startDateTime < apptEnd) ||
        (endDateTime > apptStart && endDateTime <= apptEnd)
      ) {
        alert('This time slot is already booked. Please select a different time.')
        return
      }
    }

    // If no overlap, create the appointment
    await addDoc(collection(db, 'Appointments'), {
      ExpertId: selectedExpert.value.id,
      ExpertName: selectedExpert.value.Name,
      Location: selectedExpert.value.Location,
      Date: appointment.value.Date,
      Time: appointment.value.Time,
      UserId: userId || 'Anonymous',
      CreatedAt: new Date(),
    })

    alert(`Appointment confirmed with ${selectedExpert.value.Name}!`)

    // After few seconds, return to experts page
    setTimeout(() => {
      showBookingForm.value = false
      selectedExpert.value = null
      appointment.value.Date = ''
      appointment.value.Time = ''
    }, 2500)
  } catch (err) {
    console.error('Error saving appointment:', err)
  }
}

const toggleMap = async (expertId, expertLocation) => {
  // Toggle map visibility
  if (showMap.value[expertId]) {
    showMap.value[expertId] = false
    return
  }

  // Hide others and show current one
  showMap.value = { [expertId]: true }
  mapLoading.value = { [expertId]: true }

  await nextTick() // wait for DOM to render

  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const userLat = position.coords.latitude
      const userLng = position.coords.longitude

      // Create the map
      const map = new mapboxgl.Map({
        container: `map-${expertId}`,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLng, userLat],
        zoom: 12,
      })

      // Add zoom, navigation and rotation controls to the map.
      map.addControl(new mapboxgl.NavigationControl())

      // Add user marker
      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([userLng, userLat])
        .setPopup(new mapboxgl.Popup().setText('You are here'))
        .addTo(map)

      // Get expert location coordinates using Mapbox Geocoding API
      const geoRes = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          expertLocation,
        )}.json?access_token=${mapboxgl.accessToken}`,
      )
      const geoData = await geoRes.json()

      if (!geoData.features?.length) {
        alert("Unable to find the expert's location.")
        return
      }

      const expertCoords = geoData.features[0].geometry.coordinates

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(expertCoords)
        .setPopup(new mapboxgl.Popup().setText(expertLocation))
        .addTo(map)

      map.fitBounds(new mapboxgl.LngLatBounds([userLng, userLat], expertCoords), {
        padding: 50,
      })

      map.on('load', async () => {
        const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${expertCoords[0]},${expertCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        const routeRes = await fetch(routeUrl)
        const routeData = await routeRes.json()

        if (routeData.routes?.[0]?.geometry) {
          const route = routeData.routes[0].geometry

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route,
            },
          })

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#007AFF',
              'line-width': 5,
            },
          })

          // Fit the map to the route
          const routeBounds = new mapboxgl.LngLatBounds()
          route.coordinates.forEach((coord) => routeBounds.extend(coord))
          map.fitBounds(routeBounds, { padding: 50 })
        }

        mapLoading.value = { [expertId]: false }
      })
    },
    () => {
      alert('Unable to retrieve your location.')
    },
  )
}

// Open form in add mode
const openAddForm = () => {
  resetForm()
  formMode.value = 'add'
  showForm.value = true
  scrollToForm()
}

// Open form in edit mode
const openEditForm = (expert) => {
  newExpert.value = { ...expert }
  formMode.value = 'edit'
  showForm.value = true
  nextTick(() => scrollToForm())
}

// Reset form
const resetForm = () => {
  newExpert.value = {
    Name: '',
    Qualification: '',
    Specialisation: '',
    PhoneNumber: '',
    Email: '',
    Experience: '',
    Location: '',
    Profession: '',
    Clinic: '',
  }
  errors.value = {}
}

// Scroll to form
const scrollToForm = () => {
  const el = document.getElementById('expert-form')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  document.title = 'Appointment Booking | Eat Smart Hub'
  fetchUserRole()
  fetchExperts()
})
</script>

<template>
  <Header />

  <div class="container py-5">
    <div id="back-button-style">
      <router-link to="/">
        <button class="btn btn-primary mb-3">
          <i class="bi bi-arrow-left"></i> Back to dashboard
        </button>
      </router-link>
    </div>

    <h2 class="mb-4 text-center" style="color: whitesmoke">Wellness Experts</h2>

    <div v-if="showBookingForm" class="card p-4 shadow mx-auto" style="max-width: 600px">
      <button class="btn btn-secondary mb-3" @click="showBookingForm = false">
        Back to All Experts
      </button>

      <h4 style="color: #074763; text-align: center">Book Appointment</h4>

      <div class="mb-3">
        <label class="form-label fw-bold">Expert Name:</label>
        <p><SafeContent :content="selectedExpert.Name" :strip="true" /></p>
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Location:</label>
        <p><SafeContent :content="selectedExpert.Location" :strip="true" /></p>
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Select Date:</label>
        <input type="date" v-model="appointment.Date" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Select Time:</label>
        <input type="time" v-model="appointment.Time" class="form-control" />
      </div>

      <button class="btn btn-primary" @click="confirmAppointment">Confirm Appointment</button>
    </div>

    <div v-else>
      <div v-if="isAdmin" class="mb-5 px-4">
        <!-- <h4 style="color:whitesmoke">Add / Edit Expert</h4> -->

        <div class="d-flex justify-content-between align-items-center">
          <button class="btn btn-primary" @click="openAddForm">Add Expert</button>
          <button class="btn btn-primary" @click="showForm = false">Close the form</button>
        </div>
        <div v-if="showForm" id="expert-form" class="card p-4 mt-3 mb-3 shadow scroll-mt-5">
          <h4 class="header-h4">{{ formMode === 'add' ? 'Add Expert' : 'Edit Expert' }}</h4>

          <div
            class="mb-2"
            v-for="(label, key) in {
              Name: 'Name',
              Qualification: 'Qualification',
              Specialisation: 'Specialisation',
              Profession: 'Profession',
              Experience: 'Experience (years)',
              Clinic: 'Clinic',
              Location: 'Location',
              PhoneNumber: 'Phone Number',
              Email: 'Email',
            }"
            :key="key"
          >
            <label class="form-label">{{ label }}</label>
            <input
              v-model="newExpert[key]"
              :class="['form-control', errors[key] ? 'is-invalid' : '']"
            />
            <div v-if="errors[key]" class="invalid-feedback">{{ errors[key] }}</div>
          </div>

          <div class="mb-3">
            <label class="form-label">Expert Photo</label>
            <input type="file" @change="onFileChange" accept="image/*" class="form-control" />
          </div>

          <button class="btn btn-primary mt-2" @click="saveExpert(newExpert)" :disabled="loading">
            {{ formMode === 'add' ? 'Add Expert' : 'Update Expert' }}
          </button>
        </div>
      </div>

      <!-- Experts Grid -->
      <div v-if="contentLoading" class="loader-wrapper">
        <div class="loader"></div>
        <p>Loading experts...</p>
      </div>

      <div v-else class="container mt-4">
        <div class="row justify-content-center g-4">
          <div v-for="expert in wellnessExperts" :key="expert.id" class="col-12 col-md-6 col-lg-4">
            <div class="card-container">
              <div :class="['card-flip', { flipped: showMap[expert.id] }]">
                <div class="card-front shadow p-3 h-55">
                  <!-- <img
                    :src="expert.PhotoURL"
                    :alt="'Photo of ' + expert.Name"
                    class="card-img-top mb-3"
                    style="height: 300px; object-fit: cover; border-radius: 10px"
                  /> -->

                  <h4><SafeContent :content="expert.Name" :strip="true" /></h4>
                  <p>
                    <strong>Specialisation:</strong>
                    <SafeContent inline :content="expert.Specialisation" :strip="true" />
                  </p>
                  <p>
                    <strong>Qualification:</strong>
                    <SafeContent inline :content="expert.Qualification" :strip="true" />
                  </p>
                  <p>
                    <strong>Experience:</strong>
                    <SafeContent inline :content="expert.Experience" :strip="true" />
                  </p>
                  <p>
                    <strong>Profession:</strong>
                    <SafeContent inline :content="expert.Profession" :strip="true" />
                  </p>
                  <p>
                    <strong>Clinic:</strong>
                    <SafeContent inline :content="expert.Clinic" :strip="true" />
                  </p>
                  <p>
                    <strong>Location:</strong>
                    <SafeContent inline :content="expert.Location" :strip="true" />
                  </p>
                  <p>
                    <strong>Contact:</strong>
                    <SafeContent inline :content="expert.PhoneNumber" :strip="true" />
                  </p>
                  <p>
                    <strong>Email:</strong>
                    <SafeContent inline :content="expert.Email" :strip="true" />
                  </p>

                  <div class="mt-auto d-flex justify-content-between flex-wrap gap-2">
                    <button class="btn btn-primary flex-grow-1" @click="bookAppointment(expert)">
                      Book Appointment
                    </button>

                    <button
                      class="btn btn-primary flex-grow-1"
                      @click="toggleMap(expert.id, expert.Location)"
                    >
                      Show Location
                    </button>

                    <button
                      v-if="isAdmin"
                      class="btn btn-primary flex-grow-1"
                      @click="openEditForm(expert)"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <!-- Back Side: Map -->
                <div class="card-back shadow p-3 h-100">
                  <!-- <div :id="`map-${expert.id}`" style="height: 300px; border-radius: 10px;"></div> -->

                  <div
                    style="position: relative; height: 300px; border-radius: 10px; overflow: hidden"
                  >
                    <div v-if="mapLoading[expert.id]" class="map-loader-overlay">
                      <div class="loader"></div>
                    </div>
                    <div :id="`map-${expert.id}`" style="height: 100%; width: 100%"></div>
                  </div>

                  <button class="btn btn-secondary mt-3 w-100" @click="toggleMap(expert.id)">
                    Show Expert Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--- Message Pop up like Toast in mobile --->
  <transition name="fade">
    <div v-if="showMessage" class="confirmation-message">
      {{ actionMessage }}
    </div>
  </transition>

  <Footer />

  <FloatingControls />
</template>

<style scoped>
.container {
  background: var(--page-bg);
  color: var(--page-text);
  width: 100%;
  max-width: 100%;
  height: auto;
  min-height: auto;
  position: relative;
  padding: 10px;
}

/* Ensures cards don't overlap */
.card-container {
  perspective: 1000px;
  position: relative;
  height: 400px;
}

/* Flipping animation setup */
.card-flip {
  position: relative;
  width: 100%;
  height: 100%;
  /* min-height: auto; */
  transform-style: preserve-3d;
  transition: transform 0.8s ease;
  transform-origin: center;
}

/* Flip effect */
.card-flip.flipped {
  transform: rotateY(180deg);
}

/* Front & back faces of the card */
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  top: 0;
  left: 0;
  border-radius: 15px;
  color: #333;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

/* Front card gradient */
.card-front {
  background: var(--card-bg);
}

.card-front:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
}

/* Back side flipped */
.card-back {
  transform: rotateY(180deg);
  background: var(--card-bg);
}

/* Text styling */
.card-front h4 {
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 10px;
}

.card-front p {
  font-size: 0.95rem;
  margin-bottom: 6px;
  color: var(--card-text);
}

.form-label {
  font-weight: 600;
  color: var(--card-text);
}

.form-control {
  background: var(--input-bg);
  color: var(--input-text);
  border-radius: 8px;
  padding: 6px 12px;
}

.form-control::placeholder {
  color: var(--input-text);
}

/* Map container */
/*.map-container, */
[id^='map-'] {
  height: 320px;
  border-radius: 10px;
  overflow: hidden;
}

/* Ensure proper spacing between cards */
.row.g-4 {
  --bs-gutter-x: 2rem;
  --bs-gutter-y: 2rem;
}

/* Buttons spacing inside cards */
.card-front .btn,
.card-back .btn {
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-btn-bg);
  color: var(--primary-btn-text);
  border: none;
}

.card {
  background: var(--card-bg);
  color: var(--card-text);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.15);
  padding: 28px;
  transition:
    background-color 0.35s ease,
    color 0.35s ease;
}

.btn-secondary {
  background-color: var(--secondary-btn-bg);
  color: var(--secondary-btn-text);
  border: none;
}

/* Fix background color of parent container */
.page-container {
  background-color: var(--page-bg);
  min-height: 100vh;
  padding-bottom: 50px;
}

.mapboxgl-map {
  border-radius: 15px;
  overflow: hidden;
}

#back-button-style {
  margin-left: 20px;
}

.loader-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(0, 255, 255, 0.5);
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #00ffff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
  box-shadow:
    0 0 10px #00ffff,
    0 0 20px #00ffff;
}

.map-loader-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.confirmation-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--accent);
  color: var(--button-text);
  padding: 12px 20px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  font-weight: 500;
  z-index: 2000;
  animation: slideIn 0.3s ease;
  text-align: center;
}

@keyframes slideIn {
  from {
    transform: translate(-50%, 30px);
    opacity: 0;
  }
  to {
    transform: translateY(-50%, 0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
