<script setup>
    import NavigationBar from './NavigationBar.vue'
    import Logo from '/images/Logo.jpg'
    
</script>

<template>
    <div id="header-style">
        
        <router-link to="/dashboard" style="text-decoration: none;">
            <div class="logo-container">
                <img :src="Logo" alt="Logo" height="50" width="50" />
                <h1 id="h1-style" class="mb-0 ms-2">Eat Smart Hub</h1>
            </div>
        </router-link>

        <NavigationBar /> 
    </div>    
</template>

<style scoped>
    #header-style {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        background-color: var(--page-bg);
        color: var(--page-text);

        padding: 10px 25px;
        margin-bottom: 20px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);

        z-index: 1000; /* keeps it above other elements */
    }

    .logo-container {
        display: flex;
        align-items: center;
    }

    #h1-style {
        margin: 0; 
        font-size: 1.8rem; 
        color: var(--page-text); 
        font-weight: 600; 
        align-content: start;
    }
</style>
