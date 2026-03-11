<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { onMounted } from 'vue'
import FloatingControls from '@/components/FloatingControls.vue'

onMounted(() => {
  document.title = 'About Us - Eat Smart Hub'
})
</script>

<template>
  <Header />

  <div class="container py-4 px-4">
    <!-- Header Title -->
    <router-link to="/">
      <button class="justify-content-start mb-3 btn btn-primary">Go Back to Dashboard</button>
    </router-link>

    <h1 class="header-h1 fw-bold mx-3 text-center mb-3">
      About <span class="highlight">Eat Smart Hub</span>
    </h1>

    <!-- About Us Card -->
    <div class="about-us-card border-0 shadow-lg p-5 mx-auto">
      <h3 class="about-us-title text-center mb-4">About Us</h3>
      <p class="about-us-content fs-5 text-center">
        Eat Smart Hub is a student-driven project developed as part of an academic assignment at
        <b>Monash University</b>. The platform is designed to explore the use of modern web
        technologies in creating interactive, user-friendly applications that promote healthier
        lifestyle choices.
      </p>
    </div>

    <!-- Mission & Vision Section -->
    <div class="row g-4 mt-4">
      <!-- Mission -->
      <div class="col-md-6">
        <div class="mission-card border-0 shadow-lg p-4 h-100">
          <h3 class="mission-title text-center mb-3">Our Mission</h3>
          <p class="mission-content fs-6 text-center">
            To create a professional, educational, and engaging platform that demonstrates technical
            skills in software development while highlighting the importance of smart and
            sustainable eating habits.
          </p>
        </div>
      </div>

      <!-- Vision -->
      <div class="col-md-6">
        <div class="vision-card border-0 shadow-lg p-4 h-100">
          <h3 class="vision-title text-center mb-3">Our Vision</h3>
          <p class="vision-content fs-6 text-center">
            To serve as a benchmark for applying classroom learning into real-world solutions, and
            to inspire innovation in health technology, nutrition, and digital wellness
            applications.
          </p>
        </div>
      </div>
    </div>

    <!-- Disclaimer Card -->
    <div class="disclaimer-card border-0 shadow-lg p-4 mt-5 mx-auto">
      <h4 class="disclaimer-title text-center mb-3">Disclaimer</h4>
      <p class="disclaimer-content fs-6 text-center">
        This project has been developed solely for educational purposes as part of a Monash
        University coursework assignment. It is not intended for commercial use.
      </p>
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
  font-size: 2.5rem;
}

.highlight {
  color: yellowgreen;
  font-weight: bold;
}

.btn-primary {
  background-color: var(--primary-btn-bg);
  color: var(--primary-btn-text);
  border: none;
}

.mission-card,
.vision-card,
.about-us-card,
.disclaimer-card {
  max-width: 900px;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.15);
  padding: 28px;
  transition:
    background-color 0.35s ease,
    color 0.35s ease;
}

.mission-title,
.about-us-title,
.vision-title,
.disclaimer-title {
  color: var(--accent);
}

.mission-content,
.vision-content,
.about-us-content,
.disclaimer-content {
  color: var(--card-text);
  line-height: 1.8;
}

p {
  line-height: 1.8;
}

@media (max-width: 768px) {
  .header-h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .header-h1 {
    font-size: 1.6rem;
  }
  .btn-primary {
    width: 100%;
  }
}
</style>
