<script setup>
    import { ref, computed, onMounted } from "vue"
    import Header from '../components/Header.vue'
    import Footer from '../components/Footer.vue'
    import FloatingControls from '@/components/FloatingControls.vue'
    import SymptomsData from '../assets/json/symptoms.json'

    const selectedSymptoms = ref([])
    const adviceList = ref([])
    const riskLevel = ref("Low")
    const needsDoctor = ref(false)

    const symptoms = computed(() => SymptomsData.symptoms.map(s => s.name))

    const checkSymptoms = () => {
        const advice = []
        let riskScore = 0

        selectedSymptoms.value.forEach(symptom => {

            const symptomData = SymptomsData.symptoms.find(
                s => s.name === symptom
            )

            if(symptomData){
                advice.push(...symptomData.advice)

                if(symptomData.severity === "low"){
                    riskScore += 1
                }

                if(symptomData.severity === "medium"){
                    riskScore += 2
                }

                if(symptomData.severity === "high"){
                    riskScore += 3
                }
            }
        })

        // Remove duplicates from list if any
        adviceList.value = [...new Set(advice)] 

        if(riskScore <= 2){
            riskLevel.value = "Low Risk"
            needsDoctor.value = false
        }
        else if(riskScore <= 4){
            riskLevel.value = "Moderate Risk"
            needsDoctor.value = false
        }
        else{
            riskLevel.value = "High Risk"
            needsDoctor.value = true
        }
    }

    const runTests = () => {
        console.log("Running Symptom Checker Tests")

        // Test Case 1
        selectedSymptoms.value = ["Headache"]
        checkSymptoms()
        console.log("Test 1", adviceList.value, needsDoctor.value)

        // Test Case 2
        selectedSymptoms.value = ["Fever"]
        checkSymptoms()
        console.log("Test 2", adviceList.value, needsDoctor.value)

        // Test Case 3
        selectedSymptoms.value = ["Headache","Fatigue"]
        checkSymptoms()
        console.log("Test 3", adviceList.value, needsDoctor.value)

        // Test Case 4
        selectedSymptoms.value = ["Headache","Fever"]
        checkSymptoms()
        console.log("Test 4", adviceList.value, needsDoctor.value)

        // Test Case 5
        selectedSymptoms.value = ["Headache","Stomach Pain"]
        checkSymptoms()
        console.log("Test 5", adviceList.value, needsDoctor.value)

        // Test Case 6
        selectedSymptoms.value = ["Headache", "Fever", "Stomach Pain"]
        checkSymptoms()
        console.log("Test 6", adviceList.value, needsDoctor.value)

        // Test Case 7
        selectedSymptoms.value = ["UnknownSymptom"]
        checkSymptoms()
        console.log("Test 7", adviceList.value, needsDoctor.value)

        // Test Case 8
        selectedSymptoms.value = []
        checkSymptoms()
        console.log("Test 8", adviceList.value, needsDoctor.value)

    }

    onMounted(() => {
        document.title = "Symptom Checker | Eat Smart Hub"
    })
</script>

<template>
    <Header />

    <div class="symptom-section container">
        <router-link to="/">
            <button class="justify-content-start mb-3 btn btn-primary">Go Back to Dashboard</button>
        </router-link>

        <div class="symptom-header text-center mb-4">
            <h1 class="section-title"> Smart Symptom Checker </h1>
            <p class="subtitle">
                Select symptoms and receive smart health advice
            </p>
        </div>
        <div class="symptom-grid">
            <label v-for="symptom in symptoms" :key="symptom" class="symptom-card">
                <input
                    type="checkbox"
                    :value="symptom"
                    v-model="selectedSymptoms"
                />
                <span>{{ symptom }}</span>
            </label>
        </div>

        <div class="text-center mt-4">
            <button class="check-btn" @click="checkSymptoms">
                Check Health Advice
            </button>
        </div>
            
        <div v-if="adviceList.length" class="result-card mt-4">
            <div class="risk-badge mb-3">
                Risk Level: <span class="badge">{{ riskLevel }}</span>
            </div>

            <h4 class="mb-3">Recommended Advice</h4>

            <ul class="advice-list">
                <li v-for="(item,index) in adviceList" :key="index">
                    {{ item }}
                </li>
            </ul>

            <div v-if="needsDoctor" class="doctor-warning">
                <router-link to="/appointmentBooking">
                    <button class="btn btn-primary">
                        <i class="bi bi-building-fill-add"></i> Book an appointment
                    </button>
                </router-link>
            </div>

            <div class="text-center">
                <button class="test-btn" @click="runTests">
                    Run Console Tests
                </button>
            </div>
        </div>
    </div>

    <Footer />

    <FloatingControls />
</template>

<style scoped>
    .symptom-section{
        background: var(--section-bg);
        padding: 1.5rem;
        transition: all 0.35s ease;
    }

    .section-title{
        color: var(--accent);
        font-weight:700;
    }

    .subtitle{
        color: var(--section-text);
    }

    .symptom-grid{
        display: grid;
        grid-template-columns : repeat(auto-fit, minmax(170px,1fr));
        gap: 16px;
    }

    .symptom-card{
    background: var(--card-bg);
        border:3px solid var(--card-border);
        border-radius:15px;
        padding:15px;
        display:flex;
        align-items:center;
        gap:10px;
        cursor:pointer;
        transition: all 0.35s ease;
        color:var(--card-text);
    }

    .symptom-card:hover{
        transform:translateY(-5px);
        border-color:var(--accent);
        box-shadow:0 8px 20px var(--shadow-color);
    }

    .check-btn{
        padding:12px 28px;
        font-size:16px;
        border-radius:15px;
    }

    .result-card{
        background:var(--card-bg);
        border:3px solid var(--card-border);
        border-radius:20px;
        padding:25px;
        box-shadow:0 8px 20px var(--shadow-color);
        transition: all 0.35s ease;
        color:var(--card-text);
    }

    .result-card:hover{
        border-color:var(--accent);
    }

    .advice-list{
        text-align:left;
        margin-bottom:20px;
    }

    .advice-list li{
        padding:6px 0;
    }

    .risk-badge{
        font-weight:600;
        color:var(--accent);
    }

    .badge{
        background:var(--accent);
        padding:6px 14px;
        border-radius:20px;
        margin-left:8px;
        color:var(--card-text-alt);
    }

    .doctor-warning{
        color:#e63946;
        font-weight:600;
        margin:20px 0;
    }

    .test-btn{
        background:var(--secondary-btn-bg);
        color:var(--secondary-btn-text);
        border:none;
        padding:10px 18px;
        border-radius:10px;
        cursor:pointer;
        margin-top:20px;
    }

    .test-btn:hover{
        opacity:0.9;
    }

</style>
