<script setup>
    import { ref, onMounted } from "vue";
    import { theme, toggleTheme } from './ThemeStore.js';
</script>

<template>
    <label class="switch">
        <input type="checkbox" @change="toggleTheme" :checked="theme === 'dark'" />
        <span class="slider round"></span>
    </label>
</template>

<style scoped>
    .switch {
        position: relative;
        display: inline-block;
        width: 70px;
        height: 34px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        inset: 0;
        background-color: var(--toggle-track);
        border-radius: 34px;
        transition: 0.4s;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: var(--toggle-knob);
        border-radius: 50%;
        transition: 0.4s;
    }
    input:checked + .slider {
        background-color: var(--accent);
    }
    input:checked + .slider:before {
        transform: translateX(36px);
    }

</style>
