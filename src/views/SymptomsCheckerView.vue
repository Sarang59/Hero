<script>
import SymptomsData from '../assets/json/symptoms.json'

const selectedSymptoms = ref([])
const adviceList = ref([])
const riskLevel = ref('Low')
let needsDoctor = false

const checkSymptoms = () => {
  const advice = []
  let riskScore = 0

  selectedSymptoms.value.forEach((symptom) => {
    const symptomData = SymptomsData.symptoms.find((s) => s.name === symptom)

    if (symptomData) {
      advice.push(...symptomData.advice)

      if (symptomData.severity === 'low') {
        riskScore += 1
      }

      if (symptomData.severity === 'medium') {
        riskScore += 2
      }

      if (symptomData.severity === 'high') {
        riskScore += 3
      }
    }
  })

  // Remove duplicates from list if any
  adviceList.value = [...new Set(advice)]

  if (riskScore <= 2) {
    riskLevel.value = 'Low Risk'
    needsDoctor = false
  } else if (riskScore <= 4) {
    riskLevel.value = 'Moderate Risk'
    needsDoctor = false
  } else {
    riskLevel.value = 'High Risk'
    needsDoctor = true
  }
}
</script>

<template></template>

<style scoped></style>
