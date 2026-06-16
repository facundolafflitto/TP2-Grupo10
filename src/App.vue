<template>
    <div class="app-shell">
        <header class="topbar">
            <RouterLink class="brand" to="/">
                <span class="brand-mark">M10</span>
                <span>Marketplace Grupo 10</span>
            </RouterLink>

            <nav class="nav">
                <RouterLink to="/">Inicio</RouterLink>
                <RouterLink to="/productos">Productos</RouterLink>
                <RouterLink to="/ordenes">Ordenes</RouterLink>
                <RouterLink v-if="!user" to="/login">Login</RouterLink>
                <RouterLink v-if="!user" class="nav-action" to="/registro">Registro</RouterLink>
            </nav>

            <div v-if="user" class="session-box">
                <span>{{ user.nombre }}</span>
                <button type="button" @click="logout">Salir</button>
            </div>
        </header>

        <RouterView />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { clearCurrentUser, getCurrentUser } from "./services/session";

const user = ref(getCurrentUser());

function refreshSession() {
    user.value = getCurrentUser();
}

function logout() {
    clearCurrentUser();
}

onMounted(function() {
    window.addEventListener("session-changed", refreshSession);
});

onUnmounted(function() {
    window.removeEventListener("session-changed", refreshSession);
});
</script>
