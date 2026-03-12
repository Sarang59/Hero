import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import FeedbackFormView from '../views/FeedbackFormView.vue'
import SignInView from '../views/SignInView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ReportView from '@/views/ReportView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DosDontsView from '@/views/DosDontsView.vue'
import GenAISupportView from '@/views/GenAISupportView.vue'
import AboutUsView from '@/views/AboutUsView.vue'
import HandlePeerPressureView from '@/views/HandlePeerPressureView.vue'
import LearningView from '@/views/LearningView.vue'
import AppointmentBooking from '@/views/AppointmentBooking.vue'
import MapView from '@/views/MapView.vue'
import SettingsView from '@/views/SettingsView.vue'
import SymptomsCheckerView from '@/views/SymptomsCheckerView.vue'

const routes = [
  {
    path: '/signIn',
    name: 'SignIn',
    component: SignInView
  },
  {
    path: '/forgotPassword',
    name: 'ForgotPassword',
    component: ForgotPasswordView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  },
  {
    path: '/dosDonts',
    name: 'DosAndDonts',
    component: DosDontsView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/report',
    name: 'Report',
    component: ReportView
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/feedbackForm',
    name: 'FeedbackForm',
    component: FeedbackFormView
  },
  {
    path: "/genAISupport",
    name: "GenAISupport",
    component: GenAISupportView
  },
  {
    path: "/aboutUs",
    name: "AboutUs",
    component: AboutUsView
  },
  {
    path: "/handlePeerPressure",
    name: "HandlePeerPressure",
    component: HandlePeerPressureView
  },
  {
    path: "/learning",
    name: "Learning",
    component: LearningView
  },
  {
    path: "/appointmentBooking",
    name: "AppointmentBooking",
    component: AppointmentBooking
  },
  {
    path: "/maps",
    name: "Maps",
    component: MapView
  },
  {
    path: "/settings",
    name: "Settings",
    component: SettingsView
  },
  {
    path: "/symptomsChecker",
    name: "SymptomsChecker",
    component: SymptomsCheckerView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
