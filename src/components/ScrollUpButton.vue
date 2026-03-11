<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'

    const showScrollButton = ref(false);

    // Show button after scrolling down 300px
    const checkScroll = () => {
        showScrollButton.value = window.scrollY > 300
    }

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    onMounted(() => {
        window.addEventListener('scroll', checkScroll)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', checkScroll)
    })

</script>

<template>

    <button 
        v-if="showScrollButton"
        @click="scrollToTop"
        class="scroll-up-btn"
    >
        <i class="bi bi-arrow-up"></i>
    </button>
    
</template>

<style scoped>
    .scroll-up-btn {
        position: relative;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--accent);
        color: var(--button-text, #fff);
        border: none;
        font-size: 1.5rem;
        z-index: 1000;
        display: flex;                  
        justify-content: center;        
        align-items: center;            
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .scroll-up-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px var(--shadow-color, rgba(0,0,0,0.3));
    }
</style>
