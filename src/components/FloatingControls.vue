<script setup>
    import ToggleMode from './ToggleMode.vue';
    import ScrollUpButton from './ScrollUpButton.vue';
</script>

<template> 
    <div class="floating-controls">
        <ScrollUpButton />
        <ToggleMode />
    </div>
</template>

<style scoped>
    .floating-controls {
        position: fixed;
        bottom: 10px;
        right: 10px;
        display: flex;
        flex-direction: column; 
        justify-content: flex-end;
        align-items: flex-end;
        gap: 12px; 
        z-index: 9999;
    }
</style>

