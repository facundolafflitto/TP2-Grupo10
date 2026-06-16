<template>
    <main class="page">
        <section class="section-heading wide">
            <p class="eyebrow">Compras</p>
            <h1>Ordenes</h1>
            <p class="page-copy">Operaciones cargadas desde SQL Server mediante la API de Express y Sequelize.</p>
        </section>

        <p v-if="loading" class="state-message">Cargando ordenes...</p>
        <p v-else-if="error" class="state-message error">{{ error }}</p>
        <p v-else-if="orders.length === 0" class="state-message">No hay ordenes cargadas.</p>

        <section v-else class="table-panel">
            <div class="order-row header">
                <span>ID</span>
                <span>Comprador</span>
                <span>Estado</span>
                <span>Total</span>
                <span>Detalle</span>
            </div>
            <div v-for="order in orders" :key="order.id" class="order-row">
                <span>#{{ order.id }}</span>
                <span>{{ order.comprador }}</span>
                <span>{{ order.estado }}</span>
                <strong>$ {{ formatPrice(order.total) }}</strong>
                <span>{{ orderDetail(order) }}</span>
            </div>
        </section>
    </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { authHeaders, getCurrentUser } from "../services/session";

const orders = ref([]);
const loading = ref(true);
const error = ref("");
const user = ref(getCurrentUser());

function formatPrice(value) {
    return Number(value).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function orderDetail(order) {
    if (!order.detalles || order.detalles.length === 0) {
        return "Sin detalle";
    }

    return order.detalles.map(function(detalle) {
        return detalle.producto + " x" + detalle.cantidad;
    }).join(", ");
}

async function loadOrders() {
    if (!user.value) {
        error.value = "Tenes que iniciar sesion para ver tus ordenes.";
        loading.value = false;
        return;
    }

    try {
        const response = await fetch("/api/ordenes", {
            headers: {
                ...authHeaders()
            }
        });
        const data = await response.json();

        if (!response.ok) {
            error.value = data.mensaje || "No se pudieron cargar las ordenes.";
            return;
        }

        orders.value = data;
    } catch (requestError) {
        error.value = "No se pudo conectar con el servidor.";
    } finally {
        loading.value = false;
    }
}

onMounted(loadOrders);
</script>
