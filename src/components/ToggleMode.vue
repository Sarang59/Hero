<script setup>
    import ThemeToggle from './ThemeToggle.vue';
</script>

<template>
     <!-- Floating Theme Toggle -->
    <div class="floating-theme-toggle">
      <ThemeToggle />
    </div>
</template>

<style>
    .floating-theme-toggle {
        position: relative;
        bottom: 20px;
        right: 20px;
        background: var(--card-bg);
        border-radius: 8px; 
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
        padding: 6px 8px; 
        z-index: 9999;
        transition: transform 0.3s ease, background 0.3s ease;
        width: fit-content;
    }

    .floating-theme-toggle:hover {
        transform: scale(1.05);
        background: var(--accent-light);
    }
</style>
