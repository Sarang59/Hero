import { ref } from "vue";

export const theme = ref(localStorage.getItem("theme") || "light");

export const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme.value);
    localStorage.setItem("theme", theme.value);
};
