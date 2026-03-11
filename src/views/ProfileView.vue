<script setup>
  import { ref, onMounted } from 'vue'
  import { getFirestore, doc, getDoc } from 'firebase/firestore'
  import Header from '../components/Header.vue'
  import SafeContent from '../components/SafeContent.vue'
  import Footer from '@/components/Footer.vue'
  import FloatingControls from '@/components/FloatingControls.vue'

  const db = getFirestore()

  const userProfile = ref({})
  let isGoogleUser = ref(false)

  const normalFields = ref([])

  onMounted(async () => {
    const storedUserId = localStorage.getItem('userId')

    if (storedUserId) {
      // Fetch user data from Firestore
      const userDocRef = doc(db, 'Users', storedUserId)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        userProfile.value = userData
        isGoogleUser.value = userData.GoogleSignedIn === 'Yes'

        // Create normalFields array for easy rendering
        normalFields.value = [
          { label: 'Full Name', value: `${userData.FirstName || ''} ${userData.LastName || ''}` },
          { label: 'Email', value: userData.Email },
          { label: 'Role', value: userData.Role },
          { label: 'Australian Resident', value: userData.isAustralian === 'Yes' ? 'Yes' : 'No' },
          { label: 'Gender', value: userData.Gender },
          { label: 'Phone Number', value: userData.PhoneNumber },
          { label: 'Address', value: userData.Address },
          { label: 'Date of Birth', value: userData.DateOfBirth }
        ]
      } else {
        console.log('No such document!')
      }
    } else {
      isGoogleUser.value = false
    }
  })

  onMounted(() => {
    document.title = 'Profile - EatSmartHub'
  })
</script>

<template>
  <Header />

  <div
    class="profile-page"
  >
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-lg">
            <div class="card-header text-center">
              <h2>Profile</h2>
            </div>

            <div class="card-body">
              <!-- Google Sign-In User -->
              <div v-if="isGoogleUser">
                <div class="row mb-2 align-items-center">
                  <div class="col-12 col-sm-4 text-sm-end fw-bold mb-1 mb-sm-0">Name:</div>
                  <div class="col-12 col-sm-8">
                    <SafeContent inline :content="userProfile.Name" :strip="true" />
                  </div>
                </div>

                <div class="row mb-2 align-items-center">
                  <div class="col-12 col-sm-4 text-sm-end fw-bold mb-1 mb-sm-0">Email:</div>
                  <div class="col-12 col-sm-8">
                    <SafeContent inline :content="userProfile.Email" :strip="true" />
                  </div>
                </div>

                <div class="row mb-2 align-items-center">
                  <div class="col-12 col-sm-4 text-sm-end fw-bold mb-1 mb-sm-0">Role:</div>
                  <div class="col-12 col-sm-8">
                    <SafeContent inline :content="userProfile.Role" :strip="true" />
                  </div>
                </div>
              </div>

              <!-- Normal Sign-In User -->
              <div v-else>
                <div class="row mb-2 align-items-center" v-for="(field, index) in normalFields" :key="index">
                  <div class="col-12 col-sm-4 text-sm-end fw-bold mb-1 mb-sm-0">{{ field.label }}:</div>
                  <div class="col-12 col-sm-8">
                    <SafeContent inline :content="field.value" :strip="true" />
                  </div>
                </div>
              </div>

              <div class="text-center mt-4">
                <router-link to="/">
                  <button class="btn btn-primary w-100 w-sm-auto">Go to Dashboard</button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />

  <FloatingControls />
</template>

<style scoped>
  @media (max-width: 576px) {
    .profile-page .row > div {
      text-align: left !important;
    }

    .profile-page .btn-primary {
      width: 100%;
    }
  }

  .profile-page {
    background-color: var(--page-bg);
    color: var(--page-text);
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .profile-page .card {
    border-radius: 15px;
    background-color: rgba(255, 255, 255, 0.95);
    padding: 20px;
  }

  .profile-page .card-header h2 {
    font-size: 1.8rem;
  }

  .profile-page .card-header {
    background-color: var(--card-bg);
    color: var(--card-text);
  }

  .btn-primary {
    background-color: var(--primary-btn-bg);
    color: var(--primary-btn-text);
    border: none;
  }

  .card-body {
    background-color: var(--card-bg);
    color: var(--card-text);
  }

  .profile-page p {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
</style>
