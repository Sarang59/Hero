<script setup>
    import { jsPDF } from "jspdf";
    import Header from "../components/Header.vue";
    import Footer from "../components/Footer.vue";
    import { onMounted } from "vue";
    import FloatingControls from "@/components/FloatingControls.vue";

    // Video list with title + YouTube URL + thumbnail
    const videos = [
        {
            title: "Nutrition And Why It Matters",
            alt: "Nutrition And Why It Matters",
            url: "https://www.youtube.com/watch?v=Evji_ebWZQU",
            thumbnail: "https://img.youtube.com/vi/Evji_ebWZQU/0.jpg",
        },
        {
            title: "How the Six Basic Nutrients Affect Your Body",
            alt: "How the Six Basic Nutrients Affect Your Body",
            url: "https://www.youtube.com/watch?v=inEPlZZ_SfA",
            thumbnail: "https://img.youtube.com/vi/inEPlZZ_SfA/0.jpg",
        },
        {
            title: "A Healthy Diet, A Healthier World",
            alt: "A Healthy Diet, A Healthier World",
            url: "https://www.youtube.com/watch?v=XMcab1MFaLc",
            thumbnail: "https://img.youtube.com/vi/XMcab1MFaLc/0.jpg",
        },
    ];

    // Info sections for different audiences
    const sections = [
        {
            group: "Parents & Caregivers",
            importance: "Parents and caregivers play a central role in shaping children's eating habits. Early exposure to balanced meals reduces long-term risks of obesity, diabetes, and heart disease.",
            guidelines: [
                "Encourage children to eat fruits, vegetables, and whole grains daily.",
                "Offer water instead of sugary drinks.",
                "Model healthy eating behaviors - children learn by observing.",
                "Maintain regular family mealtimes to promote bonding and mindful eating.",
            ],
            habits: [
                "Involve kids in grocery shopping and meal prep.",
                "Limit fast food and processed snacks at home.",
                "Celebrate healthy meals with positive reinforcement.",
            ],
        },
        {
            group: "Health Educators",
            importance: "Health educators are key messengers in communities, bridging the gap between scientific knowledge and public awareness. Effective nutrition education improves population health outcomes.",
            guidelines: [
                "Use evidence-based dietary recommendations (e.g., WHO, USDA guidelines).",
                "Tailor advice to local culture and economic realities.",
                "Promote moderation rather than strict restrictions.",
            ],
            habits: [
                "Develop interactive workshops in schools and communities.",
                "Use visual aids and digital tools to simplify nutrition concepts.",
                "Encourage peer discussions to make learning engaging.",
            ],
        },
        {
            group: "IT Professionals",
            importance: "With sedentary work lifestyles, IT professionals are at higher risk of weight gain, poor posture, and nutrient deficiencies. Nutrition awareness directly improves productivity and mental focus.",
            guidelines: [
                "Avoid excessive caffeine and energy drinks.",
                "Keep balanced snacks (nuts, fruit, yogurt) instead of processed chips.",
                "Stay hydrated to avoid fatigue during long screen hours.",
            ],
            habits: [
                "Plan healthy lunch breaks instead of skipping meals.",
                "Stand up and stretch every hour to improve digestion.",
                "Use meal-prep apps or reminders to maintain a healthy routine.",
            ],
        },
    ];

    // Download page info as PDF
    const downloadSectionPDF = (section) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let y = 20;

        doc.setFontSize(16);
        doc.text(`Nutrition Education - ${section.group}`, 14, y);
        y += 12;

        // --- Importance ---
        doc.setFont("helvetica", "bold");
        doc.text("Importance:", 14, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        const importanceLines = doc.splitTextToSize(section.importance, 180);
        doc.text(importanceLines, 20, y);
        y += importanceLines.length * 7 + 10;

        // --- Guidelines ---
        doc.setFont("helvetica", "bold");
        doc.text("Guidelines:", 14, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        section.guidelines.forEach((g) => {
            const lines = doc.splitTextToSize(`- ${g}`, 175);
            doc.text(lines, 20, y);
            y += lines.length * 7;
        });
        y += 10;

        // --- Habits ---
        doc.setFont("helvetica", "bold");
        doc.text("Incorporating Habits:", 14, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        section.habits.forEach((h) => {
            const lines = doc.splitTextToSize(`- ${h}`, 175);
            doc.text(lines, 20, y);
            y += lines.length * 7;

            // Add page if reaching bottom
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
        });

        doc.save(`${section.group.replace(/\s+/g, "_")}_Nutrition_Education.pdf`);
    };

    const openVideo = (url) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    onMounted(() => {
        document.title = "Learning Resources | Eat Smart Hub";
    });
</script>

<template>
    <Header />

    <div
        class="container-fluid p-4"
    >
        <!-- Navigation -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <router-link to="/">
                <button class="btn btn-primary">Back to Dashboard</button>
            </router-link>
        </div>

        <!-- Video Section -->
        <div class="mb-5">
            <h2 class="learn-header text-center fw-bold mb-4">
                Learn Through Videos
            </h2>
            <div class="row g-4">
                <div v-for="(video, index) in videos" :key="index" class="col-md-4">
                    <div class="card shadow border-0 h-100">
                        <img
                            :src="video.thumbnail"
                            class="card-img-top"
                            :alt="video.alt"
                            style="cursor:pointer; border-radius: 12px 12px 0 0;"
                            @click="openVideo(video.url)"
                        />
                        <div class="card-body text-center">
                            <h6 class="card-body-title fw-bold">{{ video.title }}</h6>
                            <button
                                class="btn btn-secondary btn-sm mt-2"
                                @click="openVideo(video.url)"
                            >
                                Watch Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info Section -->
        <div>
            <h2 class="info-header text-center fw-bold mb-4">
                Nutrition Education
            </h2>
            <div class="row g-4">
                <div
                    v-for="(section, index) in sections"
                    :key="index"
                    class="col-md-4"
                >
                    <div
                        class="card shadow-lg p-4 h-100"
                    >
                        <!-- Download button for each section -->
                        <div class="text-center mb-3">
                            <button
                                class="btn btn-secondary btn-sm"
                                @click="downloadSectionPDF(section)"
                            >
                                <i class="bi bi-download"></i> Download {{ section.group }} Info
                            </button>
                        </div>

                        <h4 class="section-header fw-bold text-center mb-3">
                            {{ section.group }}
                        </h4>

                        <p><b>Importance:</b> {{ section.importance }}</p>
                        
                        <p><b>Guidelines:</b></p>
                        <ul>
                            <li v-for="(g, i) in section.guidelines" :key="i">{{ g }}</li>
                        </ul>
                        
                        <p><b>How to Incorporate Habits:</b></p>
                        <ul>
                            <li v-for="(h, i) in section.habits" :key="i">{{ h }}</li>
                        </ul>

                        
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Footer />

    <FloatingControls />
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

    .btn-secondary {
        background-color: var(--secondary-btn-bg);
        color: var(--secondary-btn-text);
        border: none;
    }

    .card {
        background-color: var(--card-bg);
        color: var(--card-text);
        border-radius: 16px;
        transition: transform 0.2s ease-in-out;
    }

    .learning-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #074763, #0a5d80);
    }
    
    .learn-header, .info-header {
        color: var(--page-text);
    }

    .text-navy {
        color: navy;
    }

    .info-card {
        background-color: whitesmoke;
        border-left: 6px solid navy;
        border-radius: 10px;
        transition: transform 0.2s ease-in-out;
    }

    .info-card:hover {
        transform: translateY(-5px);
    }

    .card:hover {
        transform: translateY(-6px);
        transition: 0.3s ease;
    }
</style>
