<script setup>
    import HealthyFoodPic from '/images/Healthy_food_picture.jpg'
</script>

<template>
    <div class="mb-3">
        <img 
            id="banner-style"
            :src = "HealthyFoodPic" 
            alt="HealthyFoodPic"
        >
    </div>  
</template>

<style scoped>
    #banner-style {
        margin: 0 auto; 
        display: block;
        width: 95%; 
        height: 200px; 
        object-fit: cover; 
        border-radius: 20px;
        margin-bottom: 10px;
    }
</style>
