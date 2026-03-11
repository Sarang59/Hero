<script setup>
    import { onMounted, ref } from "vue";
    import jsPDF from "jspdf";
    import "jspdf-autotable";
    import Header from "../components/Header.vue";
    import Footer from "../components/Footer.vue";
    import FloatingControls from "@/components/FloatingControls.vue";

    // Content for Peer Pressure Info
    const handlingPeerPressure = ref([
        "Recognize the situation and take a moment before reacting.",
        "Be confident and assertive in your decisions.",
        "Surround yourself with friends who respect your choices.",
        "Plan ahead and practice responses for situations you may face.",
        "Seek support from mentors, teachers, or family when needed."
    ]);

    const avoidingPeerPressure = ref([
        "Politely say 'No, thank you' without overexplaining.",
        "Suggest an alternative activity to redirect the group.",
        "Use humor to defuse the situation while declining.",
        "Walk away if the pressure becomes too much.",
        "Explain your values respectfully and stand firm in your decision."
    ]);

    // Function to generate PDF
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Peer Pressure Awareness Guide", 14, 20);

        doc.setFontSize(12);
        doc.text("How to Handle Peer Pressure:", 14, 30);
        handlingPeerPressure.value.forEach((item, i) => {
            doc.text(`${i + 1}. ${item}`, 20, 40 + i * 8);
        });

        const avoidStartY = 40 + handlingPeerPressure.value.length * 8 + 10;
        doc.text("How to Politely Avoid Peer Pressure:", 14, avoidStartY);
        avoidingPeerPressure.value.forEach((item, i) => {
            doc.text(`${i + 1}. ${item}`, 20, avoidStartY + 10 + i * 8);
        });

        doc.save("Peer_Pressure_Guide.pdf");
    };

    onMounted(() => {
        document.title = "Handle Peer Pressure | Eat Smart Hub";
        window.scrollTo(0, 0);
    });
</script>

<template>

    <Header />

    <div
        class="container py-4 px-4"
    >
        <!-- Title and Button Row -->
        <div class="row align-items-center mb-5">

            <div class="col-12 col-md-auto mb-3 mb-md-0">
                <router-link to="/">
                    <button class="btn btn-primary w-100 w-md-auto">Back to Dashboard</button>
                </router-link>
            </div>

            <div class="col-12 col-md text-center mb-3 mb-md-0">
                <h1 class="header-h1 fw-bold">
                    Handling <span class="text-success">Peer Pressure</span>
                </h1>
            </div>

            <div class="col-12 col-md-auto">
                <button class="btn btn-lg w-100 w-md-auto" @click="downloadPDF">
                    <i class="bi bi-download me-2"></i> Download PDF
                </button>
            </div>
        </div>

        <!-- Handling Peer Pressure Section -->
        <div class="row g-4 mb-4">
            <div class="col-md-6">
                <div
                    class="card p-4 h-100 card-success"
                >
                    <h3 class="text-success text-center mb-3">How to Handle Peer Pressure</h3>
                    <ul class="list-unstyled">
                        <li
                            v-for="(item, index) in handlingPeerPressure"
                            :key="index"
                            class="d-flex align-items-start mb-3"
                        >
                           <span class="badge rounded-circle bg-success me-3">
                                {{ index + 1 }}
                            </span>
                            <span class="fs-6">{{ item }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Avoiding Peer Pressure Section -->
            <div class="col-md-6">
                <div
                    class="card p-4 h-100 card-danger"
                >
                    <h3 class="text-danger text-center mb-3">How to Politely Avoid It</h3>
                    <ul class="list-unstyled">
                        <li
                            v-for="(item, index) in avoidingPeerPressure"
                            :key="index"
                            class="d-flex align-items-start mb-3"
                        >
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

    p {
        line-height: 1.7;
    }

    /* Card Colors */
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

    /* Make badges uniform */
    .badge {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

