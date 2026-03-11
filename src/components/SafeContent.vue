<!-- SafeContent.vue -->
<script setup>
    import { computed, toRef } from 'vue';
    import DOMPurify from 'dompurify';

    const props = defineProps({
        content: { type: String, default: '' },
        inline: { type: Boolean, default: false }, // if true, render as <span>, else <div>
        strip: { type: Boolean, default: false }   // if true, remove all HTML tags
    });

    const contentRef = toRef(props, 'content');

    const sanitizedContent = computed(() => {
        if (!contentRef.value) return '';
        return props.strip
            ? DOMPurify.sanitize(contentRef.value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
            : DOMPurify.sanitize(contentRef.value, { USE_PROFILES: { html: true } });
    });
</script>

<template>
  <!-- dynamic root tag so component can be inline or block -->
  <component :is="inline ? 'span' : 'div'" v-html="sanitizedContent" />
</template>
