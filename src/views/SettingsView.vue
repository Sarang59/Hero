<script setup> 
    import { ref, onMounted } from "vue";
    import Header from "../components/Header.vue";
    import Footer from "../components/Footer.vue";
    import { theme, toggleTheme } from '../components/ThemeStore.js';
    import FloatingControls from "@/components/FloatingControls.vue";

    onMounted(() => {
        document.title = "Settings | Eat Smart Hub";
        const saved = localStorage.getItem("theme");
        if (saved) {
            document.documentElement.setAttribute("data-theme", saved);
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    });

    // Listen to storage changes (if user opens multiple tabs)
    window.addEventListener("storage", (e) => {
        if (e.key === "theme") theme.value = e.newValue;
    });
</script>

<template> 
    <Header />

    <div class="settings-container p-5">
        <div class="card shadow-lg settings-card mx-auto p-4">
            <h2 class="text-center mb-4 title">Settings</h2>

            <!-- Terms & Conditions -->
            <section class="info-section">
                <h3>Terms & Conditions</h3>
                <p>
                    By using Eat Smart Hub, you agree to comply with our service terms. All
                    information provided should be accurate, and our platform must be used
                    solely for wellness and nutrition purposes. Misuse of services or
                    violations of our content policy may result in account suspension.
                </p>
            </section>

            <!-- Privacy Policy -->
            <section class="info-section">
                <h3>Privacy Policy</h3>
                <p>
                    We value your privacy. Personal information is securely stored and used
                    only to improve your experience. We do not share your data with third
                    parties without consent. For detailed policies, visit our official
                    website or contact support.
                </p>
            </section>

            <!-- Accessibility Commitment -->
            <section class="info-section">
                <h3>Accessibility Commitment</h3>
                <p>
                    Eat Smart Hub follows WCAG 2.1 Level AA accessibility standards. Our
                    platform supports screen readers, keyboard navigation, and text
                    alternatives for all non-text content. You can toggle between dark and
                    light modes for visual comfort.
                </p>
            </section>

            <!-- Navigation -->
            <div class="text-center mt-4">
                <router-link to="/">
                    <button class="btn btn-primary">
                        <i class="bi bi-arrow-left"></i> Back to Dashboard
                    </button>
                </router-link>
            </div>
        </div>
    </div>

    <Footer />

    <FloatingControls />

</template>

<style>
    /* LIGHT theme variables */
    :root[data-theme='light'] {
        --page-bg: #074763;      
        --page-text: #ffffff;    
        --card-bg: #ffffff;
        --card-bg-alt: #b4b4b4;
        --card-text: #272626;
        --card-text-alt: #ffffff;
        --accent: #0c95eb;
        --accent-light: #0d3b57;
        --hover-accent: #ffd166;
        --section-bg: whitesmoke;
        --section-text: #074763;
        --button-text: whitesmoke;  
        --toggle-track: #cfcfcf;
        --toggle-knob: #ffffff;
        --card-border: #074763;
        --primary-btn-bg: #5a7885;
        --primary-btn-text: #ffffff;
        --secondary-btn-bg: #6c757d;
        --secondary-btn-text: #ffffff;
        --circle-bg: #3498db;
        --circle-text: #ffffff;
        --table-bg: #ffffff;
        --table-header-bg: #074763;
        --table-header-text: #ffffff;
        --table-row-hover: #f8f9fa;
        --input-bg: #074763;
        --input-bg-alt: #e9ecef;
        --input-text: #fbfbfb;
        --input-text-alt: #074763;
        --input-border: #707376;
    }

    /* DARK theme variables */
    :root[data-theme='dark'] {
        --page-bg: #121c2c;        
        --page-text: #e0e0e0;
        --card-bg: #355387;
        --card-bg-alt: #7693d8;
        --card-text: #ffffff; 
        --card-text-alt: #121c2c; 
        --accent: #ffd166;
        --accent-light: #074763;
        --hover-accent: #ffd166;
        --section-bg: #0f3460;
        --section-text: #e0e0e0;
        --button-text: #121c2c;    
        --toggle-track: #5c5c5c;
        --toggle-knob: #ffffff;
        --card-border: whitesmoke;
        --primary-btn-bg: #5791b5;
        --primary-btn-text: #ffffff;
        --secondary-btn-bg: #495057;
        --secondary-btn-text: #ffffff;
        --circle-bg: #1a2942;
        --circle-text: #b8b4b4;
        --table-bg: #16213e;
        --table-header-bg: #0d3b57;
        --table-header-text: #ffffff;
        --table-row-hover: #1a2942;
        --input-bg: #1a2942;
        --input-bg-alt: #e0e0e0;
        --input-text: #e0e0e0;
        --input-text-alt: #121c2c;
        --input-border: #87aad6;
    }

    /* Page layout */
    .settings-container {
        background-color: var(--page-bg);
        color: var(--page-text);
        padding-bottom: 4rem;
        transition: background-color 0.35s ease, color 0.35s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Card */
    .settings-card {
        width: 100%;
        max-width: 880px;
        background: var(--card-bg);
        color: var(--card-text);
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(2,6,23,0.15);
        padding: 28px;
        border: 1px solid var(--card-border);
        transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease;
    }

    /* Title */
    .title {
        color: var(--accent);
        margin: 0 0 8px;
        font-weight: 700;
    }

    /* Info sections */
    .info-section {
        margin-bottom: 1.25rem;
    }
    .info-section h3 {
        margin-bottom: 0.5rem;
        color: var(--accent);
        font-weight: 600;
    }
    .info-section p {
        margin: 0;
        line-height: 1.6;
        color: var(--card-text);
    }

    .btn-primary {
        background-color: var(--primary-btn-bg);
        color: var(--primary-btn-text);
        border: none;
    }

    /* Mode label */
    .mode-label {
        color: var(--card-text);
        font-weight: 500;
    }

    /* Toggle switch (stylish, visible on both backgrounds) */
    .switch {
        position: relative;
        display: inline-block;
        width: 74px;
        height: 38px;
        vertical-align: middle;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        inset: 0;
        cursor: pointer;
        border-radius: 30px;
        background: var(--toggle-track);
        transition: background 0.28s ease, box-shadow 0.28s ease;
        box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
    }
    .slider:before {
        content: "";
        position: absolute;
        height: 30px;
        width: 30px;
        left: 4px;
        top: 4px;
        border-radius: 50%;
        background: var(--toggle-knob);
        transition: transform 0.28s ease, background 0.28s ease, box-shadow 0.28s ease;
        box-shadow: 0 6px 14px rgba(2,6,23,0.12);
    }

    /* When checked: track becomes accent, knob slides */
    .switch input:checked + .slider {
        background: var(--accent);
    }
    .switch input:checked + .slider:before {
        transform: translateX(36px);
    }

    /* Make sure toggle contrast is good on both themes */
    .switch:focus-within .slider {
        outline: 3px solid rgba(255, 255, 255, 0.12);
        outline-offset: 3px;
    }

    /* Small responsive tweaks */
    @media (max-width: 576px) {
        .settings-card {
            padding: 18px;
            margin: 0 16px;
        }
    }

</style>
