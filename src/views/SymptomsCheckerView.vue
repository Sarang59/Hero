<script>
    import SymptomsData from '../assets/json/symptoms.json'

    const selectedSymptoms = ref([])
    const adviceList = ref([])
    const riskLevel = ref("Low")
    let needsDoctor = false

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
            needsDoctor = false
        }
        else if(riskScore <= 4){
            riskLevel.value = "Moderate Risk"
            needsDoctor = false
        }
        else{
            riskLevel.value = "High Risk"
            needsDoctor = true
        }
    }

    const runTests = () => {
        console.log("Running Symptom Checker Tests")

        // Test Case 1
        selectedSymptoms.value = ["Headache"]
        checkSymptoms()
        console.log("Test 1")
        console.log(adviceList.value)
        console.log(needsDoctor)

        // Test Case 2
        selectedSymptoms.value = ["Fever"]
        checkSymptoms()
        console.log("Test 2")
        console.log(adviceList.value)
        console.log(needsDoctor)

        // Test Case 3
        selectedSymptoms.value = ["Headache","Fatigue"]
        checkSymptoms()
        console.log("Test 3")
        console.log(adviceList.value)
        console.log(needsDoctor)

        // Test Case 4
        selectedSymptoms.value = ["Headache","Fever"]
        checkSymptoms()
        console.log("Test 4")
        console.log(adviceList.value)
        console.log(needsDoctor)

        // Test Case 5
        selectedSymptoms.value = ["Headache","Stomach Pain"]
        checkSymptoms()
        console.log("Test 5")
        console.log(adviceList.value)
        console.log(needsDoctor)

        // Test Case 6
        selectedSymptoms.value = ["UnknownSymptom"]
        checkSymptoms()
        console.log("Test 6")
        console.log(adviceList.value)
        console.log(needsDoctor)

        // Test Case 7
        selectedSymptoms.value = []
        checkSymptoms()
        console.log("Test 7")
        console.log(adviceList.value)
        console.log(needsDoctor)

    }
</script>

<template>

</template>

<style scoped>

</style>
