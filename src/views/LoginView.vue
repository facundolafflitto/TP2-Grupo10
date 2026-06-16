<template>
    <main class="page two-column">
        <section class="panel">
            <p class="eyebrow">Acceso</p>
            <h1>Iniciar sesion</h1>
            <p class="page-copy">Ingreso para compradores y vendedores del marketplace.</p>
        </section>

        <form class="form-card" @submit.prevent="submitLogin">
            <label>
                Email
                <input v-model="form.email" type="email" placeholder="usuario@email.com" required>
            </label>
            <label>
                Password
                <input v-model="form.password" type="password" placeholder="Ingresar password" required>
            </label>
            <button class="button primary" type="submit" :disabled="loading">
                {{ loading ? "Ingresando..." : "Ingresar" }}
            </button>
            <p class="form-note">{{ message }}</p>
        </form>
    </main>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { setSession } from "../services/session";

const router = useRouter();

const form = reactive({
    email: "",
    password: ""
});

const loading = ref(false);
const message = ref("Completá tus datos para iniciar sesión.");

async function submitLogin() {
    loading.value = true;
    message.value = "Validando usuario...";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        const data = await response.json();

        if (!response.ok) {
            message.value = data.mensaje || "No se pudo iniciar sesión.";
            return;
        }

        setSession(data.usuario, data.token);
        message.value = "Bienvenido, " + data.usuario.nombre + ".";
        router.push("/productos");
    } catch (error) {
        message.value = "No se pudo conectar con el servidor.";
    } finally {
        loading.value = false;
    }
}
</script>
