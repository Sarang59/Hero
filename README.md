# EatSmartHub

This project helps you get started developing a modern, full-featured Vue 3 application built with Vite.
EatSmartHub integrates powerful APIs and libraries for authentication, data visualization, geolocation, accessibility, and deployment.

## Problem

Many people want to maintain a healthy diet but face several challenges:

1. Lack of nutritional awareness about daily food intake
2. Students eat Junk Food due to peer pressure
3. Don't know which wellness expert to contact to seek help
4. IT Engineers, early parents don't know about good health traits
5. Existing health apps are often complex or require subscriptions

## Solution

Eat Smart Hub is a web application that helps users make smarter food choices and manage their diet easily.
The application allows users to:

1. Provides guidance on daily food intake, including recommended Do's and Don'ts to help users maintain a healthy and balanced diet.
2. Offers information and practical strategies to help students manage and respond to peer pressure in a healthy and responsible manner.
3. Helps users find qualified wellness experts by providing details such as clinic name, location, qualifications, and areas of specialisation.
4. Displays the location of wellness experts on a map, allowing users to view directions and compare the distance between their location and the clinic, with results listed in ascending order based on proximity.
5. Provides learning resources on health and wellness, along with an AI-powered assistant that users can interact with to receive general health guidance and advice.
6. Also enable user to download the information in pdf file.

## Tech Stack

1. Vue JS - Frontend framework for building the user interface
2. Javascript - Application logic and interactivity
3. Firebase - Backend-as-a-Service platform used for:
4. Firebase Realtime Database - Data storage
5. Firebase Authentication - User authentication and login
6. Firebase Storage - File and media storage
7. Firebase Cloud Functions - Serverless backend logic

## APIs and Libraries

1. Mailgun - Email service for sending notifications
2. Mapbox - Maps and location services
3. FullCalendar - Calendar and scheduling interface
4. Chart.js - Data visualization and charts
5. jsPDF - PDF generation
6. Gemini - AI-powered health advice and chatbot functionality

## Tools

1. Github - Version control and project repository
2. Visual Studio Code - Code editor and development environment

## Architecture

### Architecture Flow

User -> Browser UI (VUE Component) -> Vue Application Logic -> External API / local data -> Results

### Components Based Architecture

src
|
components
|-> Banner.vue
|-> Dashboard.vue
|-> FeedbackForm.vue
|-> FloatingControls.vue
|-> Footer.vue
|-> Header.vue
|-> NavigationBar.vue
|-> SafeContent.vue
|-> ScrollUpButton.vue
|-> ThemeStore.js
|-> ThemeToggle.vue
|-> ToggleMode.vue

|
router
|-> index.js

|
views
|-> AboutUsView.vue
|-> AppointmentBooking.vue
|-> DashboardView.vue
|-> DosDontsView.vue
|-> FeedbackFormView.vue
|-> GenAISuppoerView.vue
|-> HandlePeerPressureView.vue
|-> LearningView.vue
|-> MapView.vue
|-> ProfileView.vue
|-> ReportView.vue
|-> SettingsView.vue

## Recommended IDE Setup

Use VSCode with the following extensions for an optimal development experience: - Volar (disable Vetur) - ESLint - Prettier

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Additional Packages:

```sh
### Firebase
npm install firebase

### Prime VUE
npm install primevue primeicons

### Chart JS
npm install chart.js

### JSPDF
npm install jspdf

### Full Calendar Library
npm install fullcalendar

### Map Box API
npm install mapbox-gl

### Full Calendar API
npm install @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

### Mailgun
npm install mailgun.js form-data

### Gemini
npm install @google/generative-ai
```

## Firebase Authentication

### Install Firebase

```sh
npm install firebase
```

### Setup Firebase

Create a Firebase project from Firebase Console (https://console.firebase.google.com/)
Then add your Firebase credentials in a .env file:

```sh
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Initialize Firebase

Create /src/firebase.js:

```sh
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Datatables

Installation

```sh
npm install primevue primeicons
```

Setup

```sh
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

app.use(PrimeVue);
app.component('DataTable', DataTable);
app.component('Column', Column);
```

### Email - Mailgun API integration

Installation:

```sh
npm install mailgun.js form-data
```

### Deployment (Cloudflare)

Build your app

```sh
npm run build
```

Go to Cloudflare Pages
Connect your GitHub repository.
Set build command:

```sh
npm run build
```

Set output directory:

```sh
dist
```

Deploy your project

### Cloud functions

If you are using Firebase Cloud Functions or Node serverless APIs:

Installations:

```sh
npm install -g firebase-tools
firebase init functions
```

Deployment

```sh
firebase deploy --only functions
```

### Geolocation (Mapbox API)

Installation

```sh
npm install mapbox-gl
```

### Export Features

Export to PDF (jsPDF)

Installation

```sh
npm install jspdf
```

Usage

```sh
import jsPDF from "jspdf";
const doc = new jsPDF();
doc.text("Exported Content", 10, 10);
doc.save("export.pdf");
```

Export to CSV:

```sh
const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
const link = document.createElement("a");
link.href = encodeURI(csvContent);
link.download = "data.csv";
link.click();
```

### Appointment Booking (Full Calendar API)

Installation

```sh
npm install @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

Usage

```sh
<FullCalendar :plugins="[dayGridPlugin, interactionPlugin]" :events="events" />
```

### Interactive Charts

Installation:

```sh
npm install chart.js
```

Usage:

```sh
import { Chart } from 'chart.js';
new Chart(document.getElementById('myChart'), {
    type: 'bar',
    data: { labels: ['A', 'B'], datasets: [{ data: [10, 20] }] }
});

```

### Gemini API

Installation

```sh
npm install @google/generative-ai
```

Usage:

```sh
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const result = await model.generateContent("Explain healthy eating habits");
console.log(result.response.text());
```

### Admin Dashboard

The admin dashboard offers privileged functionality such as: - Managing wellness experts - Viewing all appointments - Generating reports

Role-based access ensures only admin users can access these sections:

```sh
if (user.role !== 'admin') {
    router.push('/unauthorized');
}
```
