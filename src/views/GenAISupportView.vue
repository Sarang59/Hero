<script setup>
import { onMounted, ref } from 'vue'
import { jsPDF } from 'jspdf'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import FloatingControls from '@/components/FloatingControls.vue'

// Fetched API key from .env file: VITE_GEMINI_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

let userInput = ref('')

const showToast = ref(false)
const toastMessage = ref('')

// Store history of prompts and responses
let history = ref([])
let loading = ref(false)

const shortenResponse = (text, maxLines = 5) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  return lines.slice(0, maxLines).join('\n') + (lines.length > maxLines ? '...' : '')
}

// Detect greetings and respond politely
const isGreeting = (question) => {
  const greetings = [
    'hi',
    'hello',
    'hey',
    'how are you',
    'good morning',
    'good afternoon',
    'good evening',
  ]

  const lower = question.toLowerCase().trim()
  return greetings.some((greet) => lower.startsWith(greet) || lower === greet)
}

// Check if the question is related to "Public Health through Nutrition Education"
const isTopicRelated = (question) => {
  const keywords = [
    'nutrition',
    'diet',
    'healthy eating',
    'public health',
    'malnutrition',
    'nutrients',
    'food',
    'balanced diet',
    'vitamin',
    'mineral',
    'nutrition education',
    'obesity',
    'underweight',
    'school nutrition',
    'health promotion',
    'community health',
    'food habits',
    'wellness',
    'dietary',
    'eating',
    'lifestyle',
    'chronic disease',
    'prevention',
    'nutritional status',
    'food security',
    'hygiene',
    'sanitation',
    'hydration',
    'supplements',
    'meal planning',
    'healthy recipes',
    'food safety',
    'portion control',
    'mindful eating',
    'nutritional guidelines',
    'dietary guidelines',
    'food pyramid',
    'fats',
    'minerals',
    'carbohydrates',
    'protiens',
    'roughage',
  ]

  const lowerQuestion = question.toLowerCase()
  return keywords.some((keyword) => lowerQuestion.includes(keyword))
}

// Call Gemini API
const askGenAI = async () => {
  if (!userInput.value.trim()) return

  const question = userInput.value
  userInput.value = ''
  loading.value = true

  try {
    // Handle greetings separately
    if (isGreeting(question)) {
      history.value.push({
        question,
        answer:
          'Hello! How can I help you with topics related to Public Health through Nutrition Education today?',
      })
      loading.value = false
      return
    }

    //Check topic relevance
    if (!isTopicRelated(question)) {
      history.value.push({
        question,
        answer:
          'Off-topic request denied. Please ask about Health, Nutrition and topics related to that.',
      })
      toastMessage.value =
        'Off-topic request denied. Please ask about Health, Nutrition and topics related to that.'
      showToast.value = true
      setTimeout(() => (showToast.value = false), 4000)

      loading.value = false
      return
    }

    // Fetch response from Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert in "Public Health through Nutrition Education". 
                                                Provide short, clear, and factual answers (4-5 lines maximum) related only to this topic. 
                                                If the question is outside this topic, politely decline to answer.
                                                Question: ${question}`,
                },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    let answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.'

    // Shorten the response to a maximum of 5 lines
    answer = shortenResponse(answer)

    history.value.push({ question, answer })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    history.value.push({ question, answer: 'Error fetching AI response.' })
  } finally {
    loading.value = false
  }
}

// Clear all history prompts
const clearHistory = () => {
  history.value = []
}

// Download history as PDF
const downloadPDF = () => {
  if (history.value.length === 0) {
    alert('No history to download.')
    return
  }

  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text('GenAI Support History', 10, 10)

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10
  const maxWidth = pageWidth - 2 * margin // text wrapping width
  let y = 20
  const lineHeight = 7

  history.value.forEach((item, index) => {
    // Questions in bold
    doc.setFont('helvetica', 'bold')
    let questionLines = doc.splitTextToSize(`Q${index + 1}: ${item.question}`, maxWidth)
    if (y + questionLines.length * lineHeight > 280) {
      doc.addPage()
      y = 20
    }

    doc.text(questionLines, margin, y)
    y += questionLines.length * lineHeight

    // Answers in normal font
    doc.setFont('helvetica', 'normal')
    let answerLines = doc.splitTextToSize(`A${index + 1}: ${item.answer}`, maxWidth)
    if (y + answerLines.length * lineHeight > 280) {
      doc.addPage()
      y = 20
    }

    doc.text(answerLines, margin, y)
    y += answerLines.length * lineHeight + 5 // extra spacing between entries
  })

  doc.save('GenAI_History.pdf')
}

onMounted(() => {
  document.title = 'GenAI Support - Eat Smart Hub'
})
</script>

<template>
  <Header />

  <div class="container-fluid py-4">
    <!-- Top Navigation Buttons -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2"
    >
      <router-link to="/">
        <button class="btn btn-primary w-100 w-md-auto">Back to Dashboard</button>
      </router-link>

      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-primary" @click="clearHistory">Clear All</button>
        <button class="btn btn-primary" @click="downloadPDF">Download PDF</button>
      </div>
    </div>

    <h3 class="text-center mb-3 input-title">GenAI Support Assistant</h3>

    <!-- Input Box -->
    <div class="input-card shadow mb-4 p-3">
      <div class="d-flex flex-column flex-sm-row gap-2">
        <input
          v-model="userInput"
          @keyup.enter="askGenAI"
          placeholder="Ask me anything..."
          class="form-control flex-grow-1"
        />
        <button class="btn btn-primary flex-shrink-0" @click="askGenAI">Ask</button>
      </div>
    </div>

    <div v-if="loading" class="loader-container">
      <div class="rotating-symbol"></div>
      <p class="loading-text text-center">Fetching AI response...</p>
    </div>

    <!-- History -->
    <div v-if="history.length > 0 && !loading">
      <h4 class="text-center mb-3 history-title">Conversation History</h4>
      <div class="history-card shadow p-3 mx-auto">
        <div class="d-flex flex-column gap-3 align-items-center">
          <div
            v-for="(item, index) in [...history].reverse()"
            :key="index"
            class="history-card-inside shadow p-3 w-100"
          >
            <p class="history-content-Q">Q{{ history.length - index }}: {{ item.question }}</p>
            <p class="history-content-A">A: {{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center mt-5" style="color: whitesmoke">
      <p>No questions asked yet.</p>
    </div>
  </div>

  <Footer />

  <FloatingControls />

  <!-- Toast Notification -->
  <div v-if="showToast" class="toast-message">
    {{ toastMessage }}
  </div>
</template>

<style scoped>
.container-fluid {
  background: var(--page-bg);
  color: var(--page-text);
  min-height: 100vh;
  max-width: 100%;
  position: relative;
}

.btn-primary {
  background-color: var(--primary-btn-bg);
  color: var(--primary-btn-text);
  border: none;
}

.input-card,
.history-card {
  background: var(--card-bg);
  color: var(--card-text);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.15);
  padding: 28px;
  transition: all 0.3s ease;
}

.history-card-inside {
  background: var(--card-bg-alt);
  color: var(--card-text-alt);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.15);
  padding: 28px;
  transition:
    background-color 0.35s ease,
    color 0.35s ease;
}

.input-title,
.history-title {
  color: var(--page-text);
  font-weight: 700;
  margin-bottom: 16px;
}

.history-content-Q {
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 5px;
}

.history-content-A {
  color: var(--card-text);
  margin-left: 10px;
}

input.form-control {
  background: var(--input-bg);
  color: var(--input-text);
  border-radius: 20px;
  padding: 10px;
}

input.form-control::placeholder {
  color: var(--input-text);
}

/* Centered Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40vh;
  text-align: center;
}

/* Rotating Symbol */
.rotating-symbol {
  width: 70px;
  height: 70px;
  border: 6px solid transparent;
  border-top: 6px solid #00ffcc; /* Neon turquoise */
  border-right: 6px solid #00bfa6;
  border-radius: 50%;
  animation:
    spin 1s linear infinite,
    glow 1.5s ease-in-out infinite alternate;
  margin-bottom: 10px;
}

/* Sleek Modern Loader */
.modern-loader {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(255, 255, 255, 0.2);
  border-top: 6px solid #00ffcc;
  border-radius: 50%;
  animation:
    spin 1s linear infinite,
    glow 1.5s ease-in-out infinite alternate;
}

/* Animation for smooth spin */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Glow effect */
@keyframes glow {
  0% {
    box-shadow: 0 0 10px #00ffcc;
  }
  100% {
    box-shadow: 0 0 25px #00ffcc;
  }
}

.loading-text {
  color: var(--page-text);
  font-weight: 600;
  font-size: 1.2rem;
  animation: fadeInOut 2s ease-in-out infinite;
  text-align: center;
}

.toast-message {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 99, 71, 0.9); /* Soft red tone */
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: fadeInOut 4s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  10%,
  90% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
}
</style>
