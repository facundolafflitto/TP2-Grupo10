<template>
    <main class="page two-column">
        <section class="panel">
            <p class="eyebrow">Usuarios</p>
            <h1>Crear cuenta</h1>
            <p class="page-copy">Registro inicial para operar dentro del marketplace.</p>
        </section>

        <form class="form-card" @submit.prevent="submitRegister">
            <label>
                Nombre
                <input v-model="form.nombre" type="text" placeholder="Nombre completo" required>
            </label>
            <label>
                Email
                <input v-model="form.email" type="email" placeholder="usuario@email.com" required>
            </label>
            <label>
                Password
                <input v-model="form.password" type="password" placeholder="Minimo 6 caracteres" required>
            </label>
            <button class="button primary" type="submit" :disabled="loading">
                {{ loading ? "Registrando..." : "Registrarme" }}
            </button>
            <p class="form-note">{{ message }}</p>
        </form>
    </main>
</template>

<script setup>
import { reactive, ref } from "vue";

const form = reactive({
    nombre: "",
    email: "",
    password: ""
});

const loading = ref(false);
const message = ref("Completá tus datos para crear una cuenta.");

async function submitRegister() {
    loading.value = true;
    message.value = "Creando usuario...";

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        const data = await response.json();

        if (!response.ok) {
            message.value = data.mensaje || "No se pudo registrar el usuario.";
            return;
        }

        message.value = data.mensaje;
        form.nombre = "";
        form.email = "";
        form.password = "";
    } catch (error) {
        message.value = "No se pudo conectar con el servidor.";
    } finally {
        loading.value = false;
    }
}
</script>
