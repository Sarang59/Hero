import './assets/main.css'

import { createApp, watchEffect } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css';
import router from './router'
import firebaseConfig from './firebase.js';
import { initializeApp } from "firebase/app";

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { theme } from './components/ThemeStore.js';

// Initialize Firebase
initializeApp(firebaseConfig);

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false
    }
  },
})

app.use(router).mount('#app')

