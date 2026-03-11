<script setup>
import HealthyFoodImage1 from '/images/Healthy_food_image_1.jpg'
import Header from './Header.vue'
import Quotes from '../assets/json/quotes.json'
import HealthEducators from '/images/Health_Educator.png'
import ItWorker from '/images/IT_Worker.png'
import ParentImage from '/images/Parents_Image.png'
import IntroImage from '/images/Intro_image.jpg'
import SettingGoal from '/images/Setting_goal.jpg'
import Footer from './Footer.vue'
import { ref, onMounted, computed } from 'vue'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
import SafeContent from './SafeContent.vue'
import FloatingControls from './FloatingControls.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Random quote selection logic
const randomQuote = Quotes[Math.floor(Math.random() * Quotes.length)]

// Smooth scroll to section logic
const scrollToSectionMethod = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const comments = ref([])
const db = getFirestore()
let numberOfComments = ref(0)
let numberOfUsers = ref(0)
let numberOfExperts = ref(0)
let numberOfAppointments = ref(0)
let isAdmin = ref(false)

const appointments = ref([])
const calendarAppointments = ref([])
const showAllAppointments = ref(false)
const hasAppointments = ref(false)
const selectedEvent = ref(null)
const showModal = ref(false)

const circle = ref({
  number: '',
  text: 'No Comments Yet',
})

const getComments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Ratings'))
    const allComments = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.Comment && data.Name && data.Rating && data.Name !== 'Admin') {
        allComments.push({
          text: data.Comment,
          author: data.Name,
          appropriate: data.Inappropriate,
          rating: Number(data.Rating),
        })
      }
    })

    if (allComments.length > 0) {
      const totalRating = allComments.reduce((sum, comment) => sum + comment.rating, 0)
      const averageRating = (totalRating / allComments.length).toFixed(1)
      circle.value.number = Number(averageRating) + '/5'
      circle.value.text = 'Average Rating'

      const appropriateComments = allComments.filter((c) => !c.appropriate)
      const shuffledComments = [...appropriateComments].sort(() => 0.5 - Math.random())
      comments.value = shuffledComments.slice(0, 2)

      numberOfComments.value = allComments.length
    }
  } catch (error) {
    console.error('Error fetching comments: ', error)
  }
}

const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Users'))
    let totalUsers = 0

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.Role !== 'Admin') {
        totalUsers += 1
      }
    })

    numberOfUsers.value = totalUsers
  } catch (error) {
    console.error('Error fetching users: ', error)
  }
}

const getExperts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'WellnessExperts'))
    numberOfExperts.value = querySnapshot.size
  } catch (error) {
    console.error('Error fetching experts: ', error)
  }
}

const getAllAppointmentsCount = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Appointments'))
    numberOfAppointments.value = querySnapshot.size
  } catch (error) {
    console.error('Error fetching appointments: ', error)
  }
}

const fetchAppointments = async () => {
  try {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) return

    const appointmentsSnapshot = await getDocs(collection(db, 'Appointments'))
    const allAppointments = []

    appointmentsSnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.UserId === storedUserId) {
        allAppointments.push({
          id: docSnap.id,
          expertName: data.ExpertName || 'Unknown',
          location: data.Location || 'Not specified',
          date: data.Date,
          time: data.Time,
        })
      }
    })

    const now = new Date()
    const futureAppointments = allAppointments.filter((app) => {
      const appDate = new Date(app.date)
      return appDate >= now
    })

    appointments.value = showAllAppointments.value ? allAppointments : futureAppointments
    hasAppointments.value = appointments.value.length > 0
  } catch (error) {
    console.error('Error fetching appointments: ', error)
  }
}

const fetchCalendarAppointments = async () => {
  try {
    const storedUserId = localStorage.getItem('userId')
    if (!storedUserId) return

    const snapshot = await getDocs(collection(db, 'Appointments'))

    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.UserId === storedUserId) {
        calendarAppointments.value.push({
          id: docSnap.id,
          title: `Appointment with ${data.ExpertName}`,
          start: new Date(`${data.Date}T${data.Time}`).toISOString(),
          end: new Date(
            new Date(`${data.Date}T${data.Time}`).getTime() + 30 * 60 * 1000,
          ).toISOString(),
        })
      }
    })
  } catch (error) {
    console.error('Error fetching appointments: ', error)
  }
}

const checkAdminStatus = async () => {
    const storedUserId = localStorage.getItem('userId');

    if(storedUserId) {

        // Fetch user data from Firestore
        const userDocRef = doc(db, 'Users', storedUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {

            const userData = userDocSnap.data();
            // isAdmin.value = userData.Role === "Admin";

        } else {
            console.log('No such document!');
        }
    }
    else {
        isAdmin.value = false;
    }
};

const adminCardsInformation = [
  { title: 'Total Users', value: numberOfUsers, tableName: 'users' },
  { title: 'Number of Comments', value: numberOfComments, tableName: 'comments' },
  { title: 'Number of Experts', value: numberOfExperts, tableName: 'experts' },
  { title: 'Number of Appointments', value: numberOfAppointments, tableName: 'appointments' },
]

const buttons = [
  { id: 'goal_section', label: 'Our Goal' },
  { id: 'summary_section', label: 'Summary of Health Info' },
  { id: 'community_section', label: 'This website is made for' },
  { id: 'user_opinion_section', label: 'Testimonials' },
  { id: 'calendar_section', label: 'View Calendar' },
]

const cards = [
  {
    src: ParentImage,
    alt: 'Image of Parent',
    title: 'Parents and Caregivers',
  },
  {
    src: HealthEducators,
    alt: 'Health Educator',
    title: 'Community and Health Educators',
  },
  {
    src: ItWorker,
    alt: 'IT Professional',
    title: 'IT Professionals',
  },
]

onMounted(() => {
  document.title = 'Dashboard | Eat Smart Hub'
  getUsers()
  getComments()
  getExperts()
  getAllAppointmentsCount()
  checkAdminStatus()
  fetchAppointments()
  fetchCalendarAppointments()
})
</script>

<template>
  <Header />

  <div v-if="isAdmin" class="admin-section">
    <div class="container mb-4">
      <div class="row g-4 justify-content-center">
        <div class="row gy-4 gx-3 justify-content-center">
          <div
            v-for="(card, index) in adminCardsInformation"
            :key="index"
            class="col-md-6 mt-3 mt-md-0"
          >
            <router-link
              :to="{ path: '/report', query: { table: card.tableName } }"
              class="text-decoration-none"
            >
              <div class="admin-card card text-center shadow p-3 mt-md-4">
                <div class="card-body">
                  <h5 class="card-title">{{ card.title }}</h5>
                  <p class="card-text display-6">{{ card.value }}</p>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <div class="text-center mt-4 d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/report">
            <button class="btn btn-primary">Report</button>
          </router-link>

          <button class="btn btn-secondary" @click="scrollToSectionMethod('intro_section')">
            Go to Introduction
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Introduction section -->
  <div id="intro_section" class="intro-section scroll-mt-5">
    <div class="container py-5">
      <div class="row align-items-center">
        <!--- Left Column -->
        <div class="col-12 col-md-6 mb-4 mb-md-0 px-4">
          <h2 class="intro-section-title mb-4">Eat Smart. Live Strong.</h2>

          <div class="container my-4">
            <div class="row g-3 justify-content-center">
              <div
                v-for="(button, index) in buttons"
                :key="index"
                class="col-6 d-flex justify-content-center"
              >
                <button @click="scrollToSectionMethod(button.id)" class="btn btn-primary w-100">
                  {{ button.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!---- Right Column -->
        <div class="col-12 col-md-6 px-4 d-flex justify-content-center">
          <img :src="IntroImage" alt="Introduction Image" class="section-image" />
        </div>
      </div>
    </div>
  </div>

  <!--- Goal section -->
  <div id="goal_section" class="goal-section scroll-mt-5">
    <div class="container py-5">
      <div class="row align-items-center">
        <!--- Left Column --->
        <div class="col-12 col-md-6 px-4 d-flex justify-content-center mb-3">
          <img :src="SettingGoal" alt="Goal Setting image" class="section-image" />
        </div>

        <!--- Right Column --->
        <div class="col-12 col-md-6 mb-4 mb-md-0 px-4">
          <h2 class="goal-section-title text-center mb-4">Our Goal</h2>

          <div class="goal-content-text text-center text-md-start">
            <p class="fs-5">
              This web app aims to promote healthy eating through evidence-based nutrition
              education. It provides guidance on balanced meals, nutrient roles, and recommended
              fruit and vegetable intake. By using behavior-change strategies like goal-setting and
              self-monitoring, along with interactive quizzes and videos, it encourages users to
              adopt healthy habits. The platform supports diverse cultural diets and local
              ingredients and delivers content in simple, engaging formats online and offline. It
              also offers tips to handle social pressures, helping users make confident, informed
              dietary choices for long-term wellness.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--- Summary Section --->
  <div id="summary_section" class="summary-section scroll-mt-5">
    <div class="container py-5">
      <div class="row align-items-center">
        <!--- Left Column --->
        <div class="col-12 col-md-6 mb-4 mb-md-0 px-4">
          <div class="quote-box mb-3">
            <h2 class="quote-text text-center mb-4">
              {{ randomQuote }}
            </h2>
          </div>

          <div class="summary-content-text text-center text-md-start">
            <p class="fs-5">
              Eating a healthy diet promotes vitality, mental health, and the avoidance of illness.
              Limit processed foods, sugars, and salt and prioritise whole grains, lean proteins,
              fruits, vegetables, and nuts. Drink plenty of water and eat with awareness. Meals that
              are moderate, varied, and balanced offer vital nutrients, lower health risks, and
              support long-term general wellbeing.
            </p>
          </div>
        </div>

        <!--- Right Column --->
        <div class="col-12 col-md-6 px-4 d-flex justify-content-center">
          <img :src="HealthyFoodImage1" alt="Healthy Food Image" class="section-image" />
        </div>
      </div>
    </div>
  </div>

  <!-- Community Section -->
  <div id="community_section" class="community-section container my-4 scroll-mt-5">
    <h2 class="community-section-title text-center my-4">This website is made for</h2>

    <div class="row g-4 justify-content-center">
      <div v-for="(card, index) in cards" :key="index" class="col-12 col-md-6 col-lg-4">
        <div class="community-card card text-center h-100 shadow p-3">
          <img
            :src="card.src"
            class="card-img-top mx-auto my-3"
            :alt="card.alt"
            style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 30px"
          />

          <h3 class="card-body" style="margin-top: 10px; margin-bottom: 10px; text-align: center">
            {{ card.title }}
          </h3>
        </div>
      </div>
    </div>
  </div>

  <!-- Testimonials section -->
  <div id="user_opinion_section" class="testimonials-section scroll-mt-5 py-5 px-5">
    <div class="text-center mb-5">
      <h2 class="testimonials-section-title">Testimonials</h2>
    </div>

    <div class="container">
      <div class="row align-items-center">
        <!--- Left Column --->
        <div class="col-12 col-md-6 mb-4 mb-md-0 px-4">
          <div
            v-for="(comment, index) in comments"
            :key="index"
            class="testimonial-card card mb-3 shadow-sm"
          >
            <div class="card-body">
              <SafeContent class="card-text" :content="comment.text" :strip="true" />
              <small class="comment-author">
                <SafeContent :content="comment.author" :strip="true" />
              </small>
            </div>
          </div>
        </div>

        <!--- Right Column --->
        <div class="col-12 col-md-6 px-4 d-flex justify-content-center">
          <div class="rating-circle d-flex flex-column justify-content-center align-items-center">
            <h1>{{ circle.number }}</h1>
            <p class="mb-0">{{ circle.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Appointment Calendar Section -->
  <div id="calendar_section" class="calendar-section container my-4 scroll-mt-5">
    <h2 class="calendar-section-title text-center mb-4">Appointments Calendar</h2>
    <div class="calendar-wrapper card shadow p-3">
      <div class="calendar-header p-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-muted">
            <i class="bi bi-calendar-event me-2"></i>
            Your Schedule
          </h5>
          <span class="badge bg-primary">
            {{ calendarAppointments.length }} Appointment{{
              calendarAppointments.length !== 1 ? 's' : ''
            }}
          </span>
        </div>
      </div>

      <!-- Show calendar if there are appointments -->
      <div v-if="calendarAppointments.length > 0" class="calendar-scroll-container">
        <FullCalendar
          :options="{
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: 'timeGridWeek',
            headerToolbar: {
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            },
            events: calendarAppointments,
            selectable: true,
            selectOverlap: false,
            eventTimeFormat: {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            },
            height: 'auto',
          }"
        />
      </div>

      <!-- Show message if there are no appointments -->
      <div v-else class="no-appointments text-center py-5">
        <i class="bi bi-calendar-x" style="font-size: 4rem; color: var(--accent); opacity: 0.5"></i>
        <h4 class="mt-3">No Appointments Scheduled</h4>
        <p class="text-muted">You don't have any appointments at the moment.</p>
        <router-link to="/appointmentBooking" class="btn btn-primary mt-3">
          Book an Appointment
        </router-link>
      </div>

      <div v-if="calendarAppointments.length > 0" class="calendar-footer p-3 text-center">
        <small>
          <i class="bi bi-info-circle me-1"></i>
          Scroll to view different times
        </small>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <Footer />

  <FloatingControls />
</template>

<style scoped>
.admin-section {
  background-color: var(--section-bg);
  padding: 2rem 0;
}

.admin-card {
  background-color: var(--card-bg);
  border: 3px solid var(--card-border);
  border-radius: 20px;
  color: var(--card-text);
  transition: all 0.35s ease;
}

.admin-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px var(--shadow-color);
  border: 3px solid var(--accent);
}

.admin-card .card-title {
  color: var(--accent);
  font-weight: 600;
}

.intro-section,
.summary-section,
.testimonials-section {
  background-color: var(--page-bg);
  color: var(--page-text);
  transition:
    background-color 0.35s ease,
    color 0.35s ease;
  margin-top: 20px;
}

.goal-section,
.community-section,
.calendar-section {
  background-color: var(--section-bg);
  color: var(--section-text);
  padding: 2rem;
  transition:
    background-color 0.35s ease,
    color 0.35s ease;
  margin-top: 20px;
  min-width: 100%;
}

.intro-section-title,
.summary-section-title,
.testimonials-section-title {
  color: var(--page-text);
  font-weight: 700;
  transition: color 0.35s ease;
}

.goal-section-title,
.community-section-title,
.calendar-section-title {
  color: var(--accent);
  font-weight: 700;
  transition: color 0.35s ease;
}

.calendar-wrapper {
  background-color: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.35s ease;
}

.calendar-header {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  border-bottom: 2px solid var(--card-border);
  color: white;
}

.calendar-scroll-container {
  height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: 1rem;
  background-color: var(--card-bg);

  /* Custom scrollbar styling */
  scrollbar-width: thick;
  scrollbar-color: var(--accent) var(--card-bg);
}

.calendar-footer {
  background-color: var(--card-bg);
  color: var(--accent);
  border-top: 2px solid var(--card-border);
}

/* Badge styling */
.badge {
  font-size: 0.875rem;
  padding: 6px 12px;
  border-radius: 20px;
}

:deep(.fc-timegrid-slot-label) {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.9rem;
}

:deep(.fc-timegrid-axis) {
  color: var(--accent);
}

:deep(.fc-col-header-cell-cushion) {
  color: var(--accent);
  font-weight: 700;
  font-size: 1rem;
}

:deep(.fc-col-header-cell) {
  background-color: var(--card-bg);
  border-bottom: 2px solid var(--accent);
}

:deep(.fc-header-toolbar) {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--card-bg, #fff);
  padding: 8px 0;
}

@media (max-width: 768px) {
  .calendar-scroll-container {
    height: 500px;
  }

  .calendar-section {
    padding: 1rem;
  }

  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 10px;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
  }
}

.content-text {
  color: var(--page-text);
  line-height: 1.8;
  transition: color 0.35s ease;
}

.goal-content-text {
  color: var(--section-text);
}

.summary-content-text {
  color: var(--page-text);
}

/* Quote Box */
.quote-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.35s ease;
}

.quote-text {
  color: var(--page-text);
  font-style: italic;
  font-weight: 500;
  transition: color 0.35s ease;
}

/* Images */
.section-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 20px;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition:
    box-shadow 0.35s ease,
    transform 0.3s ease;
}

.section-image:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 20px var(--shadow-color);
}

/* Community Cards */
.community-card {
  background-color: var(--card-bg);
  border: 4px solid var(--card-border);
  border-radius: 20px;
  color: var(--card-text);
  transition: all 0.35s ease;
}

.community-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px var(--shadow-color);
  border-color: var(--accent);
}

/* Testimonials */
.testimonial-card {
  background-color: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 15px;
  color: var(--card-text);
  transition: all 0.35s ease;
}

.testimonial-card:hover {
  border-color: var(--accent);
  box-shadow: 0 6px 16px var(--shadow-color);
}

.comment-author {
  color: var(--accent);
  font-weight: 600;
  display: block;
  margin-top: 0.5rem;
}

/* Rating Circle */
.rating-circle {
  width: 225px;
  height: 225px;
  border-radius: 50%;
  background-color: var(--circle-bg);
  color: var(--circle-text);
  box-shadow: 0 8px 20px var(--shadow-color);
  transition: all 0.35s ease;
}

.rating-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 28px var(--shadow-color);
}

.rating-circle h1 {
  margin: 0;
  font-size: 4rem;
  font-weight: 700;
}

.rating-circle p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

/* Appointments Section */
.appointments-card {
  background-color: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  color: var(--card-text);
  transition: all 0.35s ease;
}

.no-appointments {
  color: var(--section-text);
  opacity: 0.7;
  padding: 2rem;
}

/* Buttons */
.btn-primary {
  background-color: var(--primary-btn-bg);
  color: var(--primary-btn-text);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.btn-primary:hover {
  background-color: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--shadow-color);
}

.btn-secondary {
  background-color: var(--secondary-btn-bg);
  color: var(--secondary-btn-text);
  border: none;
}
</style>
