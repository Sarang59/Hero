<script setup>
    import Logo from '/images/Logo.jpg';
</script>

<template>
    <footer class="footer-container w-100 col-12 py-5 text-center">
        <div class="container"> 
            
            <div class="mb-3 fw-bold fs-5 logo-text">
                <img :src="Logo" alt="Logo" height="50" width="50" /> &nbsp;
                <span class="fs-4">EatSmartHub | </span> &nbsp;
                <span class="fs-4">
                    Provide <router-link to="feedbackForm" class="feedback-link"> Feedback </router-link>
                </span>
            </div>
            
            <p class="footer-description">
                EatSmartHub empowers you to make healthier choices with quick nutrition insights, personalized recommendations, and trusted health data.
            </p>
            
            <hr class="footer-divider">
            
            <p class="mt-3 footer-copyright">
                EatSmartHub <i class="bi bi-c-circle"></i> 2025. All rights reserved.
            </p>
        </div>
    </footer>
    
</template>

<style scoped>
    .footer-container {
        background-color: black;
        color: var(--page-text);
        transition: background-color 0.35s ease, color 0.35s ease;
        margin-top: 20px;
    }

    .logo-text {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        color: var(--page-text);
    }

    .feedback-link {
        color: var(--page-text);
        text-decoration: underline;
        transition: color 0.3s ease;
    }

    .feedback-link:hover {
        color: var(--toggle-track);
    }

    .footer-description {
        color: var(--page-text);
        max-width: 850px;
        margin: 0 auto 1rem auto;
        line-height: 1.6;
    }

    .footer-divider {
        width: 95%;
        border-width: 3.5px;
        border-color: var(--page-text);
        margin: 1rem auto;
    }

    .footer-container p,
    .footer-container span {
        transition: color 0.35s ease;
    }
</style>
