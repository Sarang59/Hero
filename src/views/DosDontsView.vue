<script setup>
import { onMounted, ref } from 'vue'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import FloatingControls from '@/components/FloatingControls.vue'

const dos = ref([
  'Eat plenty of fruits and vegetables daily.',
  'Choose whole grains over refined grains.',
  'Stay hydrated by drinking enough water.',
  'Limit added sugars and salt.',
  'Include healthy protein sources like beans, fish, nuts, and lean meat.',
  'Maintain portion control to avoid overeating.',
])

const donts = ref([
  'Avoid sugary drinks and excessive junk food.',
  "Don't skip breakfast regularly.",
  'Limit processed and packaged foods.',
  'Avoid excessive red and processed meats.',
  "Don't rely too much on supplements instead of real food.",
  "Don't consume alcohol excessively.",
])

// Function to generate and download PDF
const downloadPDF = () => {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text("Nutrition and Health - Dos and Don'ts", 14, 20)

  doc.setFontSize(12)
  doc.text('Dos:', 14, 30)
  dos.value.forEach((item, i) => {
    doc.text(`${i + 1}. ${item}`, 20, 40 + i * 8)
  })

  const dontStartY = 40 + dos.value.length * 8 + 10
  doc.text("Don'ts:", 14, dontStartY)

  donts.value.forEach((item, i) => {
    doc.text(`${i + 1}. ${item}`, 20, dontStartY + 10 + i * 8)
  })

  doc.save('Nutrition_Dos_and_Donts.pdf')
}

onMounted(() => {
  document.title = "Dos and Don'ts | Eat Smart Hub"
})
</script>

<template>
  <Header />

  <div class="container py-4 px-4">
    <!-- Header Title + Download Button -->
    <div class="row align-items-center mb-5">
      <!-- Back Button -->
      <div class="col-12 col-md-auto mb-3 mb-md-0">
        <router-link to="/">
          <button class="btn btn-primary w-100 w-md-auto">Go Back to Dashboard</button>
        </router-link>
      </div>

      <!-- Header Title -->
      <div class="col-12 col-md text-center mb-3 mb-md-0">
        <h1 class="header-h1 fw-bold">
          Nutrition & Health:
          <span class="text-success">Dos</span> and
          <span class="text-danger">Don'ts</span>
        </h1>
      </div>

      <!-- Download PDF Button -->
      <div class="col-12 col-md-auto">
        <button class="btn btn-lg w-100 w-md-auto" @click="downloadPDF">
          <i class="bi bi-download me-2"></i> Download PDF
        </button>
      </div>
    </div>

    <!-- Dos & Don'ts Section -->
    <div class="row g-4">
      <!-- Dos -->
      <div class="col-12 col-md-6">
        <div class="card p-4 h-100 card-success">
          <h3 class="text-success text-center mb-3">Healthy Dos</h3>
          <ul>
            <li v-for="(item, index) in dos" :key="index" class="d-flex align-items-start mb-3">
              <span class="badge rounded-circle bg-success me-3">{{ index + 1 }}</span>
              <span class="fs-6">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Don'ts -->
      <div class="col-12 col-md-6">
        <div class="card p-4 h-100 card-danger">
          <h3 class="text-danger text-center mb-3">Unhealthy Don'ts</h3>
          <ul>
            <li v-for="(item, index) in donts" :key="index" class="d-flex align-items-start mb-3">
              <span class="badge rounded-circle bg-danger me-3">{{ index + 1 }}</span>
              <span class="fs-6">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <Footer />

  <FloatingControls />
</template>

<style scoped>
.container {
  background: var(--page-bg);
  color: var(--page-text);
  min-height: 100vh;
  max-width: 100%;
  position: relative;
}

.header-h1 {
  color: var(--page-text);
  font-size: 2rem;
  line-height: 1.2;
}

.btn-lg {
  background-color: var(--primary-btn-bg);
  color: var(--primary-btn-text);
  border: none;
  border-radius: 30px;
  font-weight: 600;
}

.btn-primary {
  background-color: var(--primary-btn-bg);
  color: var(--primary-btn-text);
  border: none;
}

ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

li {
  margin: 8px 0;
}

/* Card Colors & Shadow */
.card-success {
  border-radius: 16px;
  background: #ecfdf5;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-danger {
  border-radius: 16px;
  background: #fef2f2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Badge Style */
.badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
