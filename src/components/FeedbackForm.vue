<script setup>
import { ref, onMounted } from 'vue'
import Header from './Header.vue'
import Footer from './Footer.vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import FloatingControls from './FloatingControls.vue'

let constantName = ref('')
let constantEmail = ref('')

const feedbackFormData = ref({
  email: '',
  name: '',
  rating: '',
  feedbackType: '',
  comment: '',
})

const successMessage = ref('')
const errorMessage = ref('')

const submitFeedbackData = async (feedbackFormDataValues) => {
  const auth = getAuth()
  const user = auth.currentUser

  if (user) {
    try {
      const db = getFirestore()

      // Collection is used as a reference so that a user can add multiple
      // feedback entries in same collection.
      const feedbackRef = collection(db, 'Ratings')

      const feedbackData = {
        UserId: user.uid,
        Email: feedbackFormDataValues.email,
        Name: feedbackFormDataValues.name || 'Anonymous',
        Rating: feedbackFormDataValues.rating,
        Inappropriate: false,
        FeedbackType: feedbackFormDataValues.feedbackType,
        Comment: feedbackFormDataValues.comment,
        SubmittedOn: new Date(),
      }

      // addDoc is used to add multiple entries of same user in a collection
      await addDoc(feedbackRef, feedbackData)
      successMessage.value = 'Feedback submitted successfully!'
    } catch (error) {
      errorMessage.value = 'Error in submitting feedback form. Please try again.'
    }
  } else {
    errorMessage.value = 'User is not authenticated. Please sign in.'
  }
}

const getUserDetails = async () => {
  const db = getFirestore()
  const storedUserId = localStorage.getItem('userId') || ''

  if (storedUserId) {
    // Fetch user data from Firestore
    const userDocRef = doc(db, 'Users', storedUserId)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data()
      constantEmail.value = userData.Email
      constantName.value = userData.Name || `${userData.FirstName} ${userData.LastName}`

      feedbackFormData.value.email = constantEmail.value
      feedbackFormData.value.name = constantName.value
    } else {
      console.log('No such document!')
    }
  } else {
    feedbackFormData.value.email = ''
  }
}

onMounted(() => {
  document.title = 'Feedback Form - Eat Smart Hub'
  getUserDetails()
})

const submitForm = () => {
  validateEmail(true)
  validateRating(true)
  validateFeedbackType(true)
  validateComment(true)

  if (
    !errors.value.email &&
    !errors.value.rating &&
    !errors.value.feedbackType &&
    !errors.value.comment
  ) {
    const feedbackFormDataSnapshot = { ...feedbackFormData.value }

    submitFeedbackData(feedbackFormDataSnapshot)
    clearForm()
  }
}

const clearForm = () => {
  feedbackFormData.value = {
    email: constantEmail.value,
    name: constantName.value,
    rating: '',
    feedbackType: '',
    comment: '',
  }
}

const errors = ref({
  email: null,
  rating: null,
  feedbackType: null,
  comment: null,
})

const validateEmail = (blur) => {
  if (!feedbackFormData.value.email) {
    if (blur) errors.value.email = 'Email is required'
  } else {
    const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegexPattern.test(feedbackFormData.value.email)) {
      if (blur) errors.value.email = 'Please enter a valid email Id'
    } else {
      errors.value.email = null
    }
  }
  successMessage.value = null
  errorMessage.value = null
}

const validateRating = (blur) => {
  if (feedbackFormData.value.rating === '') {
    if (blur) errors.value.rating = 'Rating is required'
  } else if (isNaN(feedbackFormData.value.rating)) {
    if (blur) errors.value.rating = 'Please enter a valid number'
  } else if (feedbackFormData.value.rating < 1 || feedbackFormData.value.rating > 5) {
    if (blur) errors.value.rating = 'Rating should be in between 1 to 5'
  } else {
    errors.value.rating = null
  }

  successMessage.value = null
  errorMessage.value = null
}

const validateFeedbackType = (blur) => {
  if (feedbackFormData.value.feedbackType === '') {
    if (blur) errors.value.feedbackType = 'Please select a feedback Type.'
  } else {
    errors.value.feedbackType = null
  }

  successMessage.value = null
  errorMessage.value = null
}

const validateComment = (blur) => {
  if (!feedbackFormData.value.comment) {
    if (blur) errors.value.comment = 'Comment is required'
  } else {
    errors.value.comment = null
  }
  successMessage.value = null
  errorMessage.value = null
}
</script>

<template>
  <div id="feedback-form-page-style">
    <Header />

    <div id="back-button-style">
      <router-link to="/">
        <button class="btn btn-primary"><i class="bi bi-arrow-left"></i> Back to dashboard</button>
      </router-link>
    </div>

    <div class="form">
      <div class="container mt-8">
        <div class="row">
          <div class="col-sm-8 offset-sm-2">
            <h2 id="h2-style" class="text-center mb-4 p-3">Feedback Form</h2>

            <form @submit.prevent="submitForm">
              <div class="row mb-3">
                <label for="email" class="col-sm-3 col-form-label"> Email: </label>
                <div class="col-sm-9">
                  <input
                    type="text"
                    id="email"
                    class="form-control"
                    placeholder="abc123@gmail.com"
                    @blur="() => validateEmail(true)"
                    @input="() => validateEmail(false)"
                    v-model="feedbackFormData.email"
                    disabled
                  />
                  <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
                </div>
              </div>

              <div class="row mb-3">
                <label for="name" class="col-sm-3 col-form-label"> Name: </label>
                <div class="col-sm-9">
                  <input
                    type="text"
                    id="name"
                    class="form-control"
                    placeholder="Please enter fullname"
                    v-model="feedbackFormData.name"
                    disabled
                  />
                </div>
              </div>

              <div class="row mb-3">
                <label for="rating" class="col-sm-3 col-form-label"> Rating: </label>
                <div class="col-sm-9">
                  <input
                    type="text"
                    id="rating"
                    class="form-control"
                    placeholder="Please enter rating (1 to 5)"
                    @blur="() => validateRating(true)"
                    @input="() => validateRating(false)"
                    v-model="feedbackFormData.rating"
                  />
                  <div v-if="errors.rating" class="text-danger">{{ errors.rating }}</div>
                </div>
              </div>

              <div class="row mb-3">
                <label for="feedbackType" class="col-sm-3 col-form-label">Feedback Type:</label>
                <div class="col-sm-9">
                  <select
                    class="form-select"
                    id="feedbackType"
                    @blur="() => validateFeedbackType(true)"
                    @input="() => validateFeedbackType(false)"
                    v-model="feedbackFormData.feedbackType"
                  >
                    <option value="">Please select feedback type</option>
                    <option value="Bug">Bug</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Compliment">Compliment</option>
                    <option value="Complaint">Complaint</option>
                  </select>
                  <div v-if="errors.feedbackType" class="text-danger">
                    {{ errors.feedbackType }}
                  </div>
                </div>
              </div>

              <div class="row mb-3">
                <label for="comment" class="col-sm-3 col-form-label"> Comments </label>
                <div class="col-sm-9">
                  <textarea
                    class="form-control"
                    id="comment"
                    placeholder="Please enter comments"
                    @blur="() => validateComment(true)"
                    @input="() => validateComment(false)"
                    v-model="feedbackFormData.comment"
                  >
                  </textarea>
                  <div v-if="errors.comment" class="text-danger">{{ errors.comment }}</div>
                </div>
              </div>

              <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
              <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>

              <div class="text-center mt-2 mb-3">
                <button type="submit" class="btn btn-primary me-2">Submit</button>
                <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer />

  <FloatingControls />
</template>

<style scoped>
.form {
  background: var(--page-bg);
  color: var(--page-text);
  position: relative;
  max-width: 95%;
  border-radius: 20px;
  margin: 0 auto 0 auto;
}

.col-form-label {
  color: var(--page-text);
  font-weight: 500;
}

.form-control,
.form-select,
.form-control:focus,
.form-select:focus,
textarea.form-control,
textarea.form-control:focus {
  background: var(--input-bg-alt);
  color: var(--input-text-alt);
  border: 1px solid var(--input-border);
}

.form-control::placeholder,
.form-select::placeholder,
textarea.form-control::placeholder {
  color: var(--input-text-alt);
}

#feedback-form-page-style {
  min-height: 100vh;
  color: whitesmoke;
}

.btn-primary {
  background-color: var(--primary-btn-bg);
  color: var(--primary-btn-text);
  border: none;
}

.btn-secondary {
  background-color: var(--secondary-btn-bg);
  color: var(--secondary-btn-text);
  border: none;
}

#back-button-style {
  margin-bottom: 20px;
  margin-left: 20px;
}

#h2-style {
  color: var(--page-text);
  padding: 10px;
}
</style>
