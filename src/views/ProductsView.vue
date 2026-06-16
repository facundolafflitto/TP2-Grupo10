<template>
    <main class="page catalog-page">
        <section class="catalog-toolbar">
            <div>
                <p class="eyebrow">Catalogo</p>
                <h1>{{ selectedCategory || "Productos" }}</h1>
                <p class="page-copy">Elegi una categoria o mira el catalogo completo. Para comprar, primero inicia sesion.</p>
            </div>
            <RouterLink v-if="!user" class="button secondary" to="/login">Iniciar sesion</RouterLink>
        </section>

        <section class="filter-bar" aria-label="Filtrar por categoria">
            <RouterLink class="filter-chip" :class="{ active: !selectedCategory }" to="/productos">Todos</RouterLink>
            <RouterLink class="filter-chip" :class="{ active: selectedCategory === 'Tecnologia' }" to="/productos?categoria=Tecnologia">Tecnologia</RouterLink>
            <RouterLink class="filter-chip" :class="{ active: selectedCategory === 'Accesorios' }" to="/productos?categoria=Accesorios">Accesorios</RouterLink>
            <RouterLink class="filter-chip" :class="{ active: selectedCategory === 'Hogar' }" to="/productos?categoria=Hogar">Hogar</RouterLink>
        </section>

        <p v-if="loading" class="state-message">Cargando productos...</p>
        <p v-else-if="error" class="state-message error">{{ error }}</p>
        <p v-else-if="products.length === 0" class="state-message">No hay productos activos en esta categoria.</p>

        <section v-else class="product-grid product-grid-refined">
            <article v-for="product in products" :key="product.id" class="product-card">
                <div class="product-visual">
                    <img
                        v-if="product.imagenUrl"
                        :src="product.imagenUrl"
                        :alt="product.titulo"
                    >
                    <span v-else>{{ product.titulo.slice(0, 1) }}</span>
                </div>

                <div class="product-body">
                    <div class="product-header">
                        <span class="product-category">{{ product.categoria }}</span>
                        <span class="stock-pill" :class="{ low: product.stock <= 3 }">
                            Stock {{ product.stock }}
                        </span>
                    </div>

                    <h2>{{ product.titulo }}</h2>
                    <p>{{ product.descripcion || "Sin descripcion." }}</p>

                    <div class="product-seller">
                        Vendedor: <strong>{{ product.vendedor }}</strong>
                    </div>

                    <div class="product-meta">
                        <strong>$ {{ formatPrice(product.precio) }}</strong>
                    </div>
                </div>

                <div class="product-actions">
                    <button
                        class="button primary"
                        type="button"
                        :disabled="!user || buyingId === product.id || product.stock <= 0"
                        @click="buyProduct(product)"
                    >
                        {{ buttonText(product) }}
                    </button>

                    <div v-if="canRestock(product)" class="restock-control">
                        <input
                            v-model.number="restockAmounts[product.id]"
                            type="number"
                            min="1"
                            aria-label="Cantidad a reponer"
                        >
                        <button
                            class="button secondary"
                            type="button"
                            :disabled="restockingId === product.id"
                            @click="restockProduct(product)"
                        >
                            {{ restockingId === product.id ? "Reponiendo..." : "Reponer" }}
                        </button>
                    </div>
                </div>
            </article>
        </section>

        <p v-if="message" class="state-message compact" :class="{ error: messageError }">{{ message }}</p>
    </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { authHeaders, getCurrentUser } from "../services/session";

const route = useRoute();
const products = ref([]);
const loading = ref(true);
const error = ref("");
const message = ref("");
const messageError = ref(false);
const buyingId = ref(null);
const restockingId = ref(null);
const restockAmounts = ref({});
const user = ref(getCurrentUser());

const selectedCategory = computed(function() {
    return route.query.categoria || "";
});

function formatPrice(value) {
    return Number(value).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

async function loadProducts() {
    loading.value = true;
    error.value = "";
    products.value = [];

    try {
        const params = new URLSearchParams();

        if (selectedCategory.value) {
            params.set("categoria", selectedCategory.value);
        }

        const query = params.toString();
        const response = await fetch("/api/productos" + (query ? "?" + query : ""));
        const data = await response.json();

        if (!response.ok) {
            error.value = data.mensaje || "No se pudieron cargar los productos.";
            return;
        }

        products.value = data;
        data.forEach(function(product) {
            if (!restockAmounts.value[product.id]) {
                restockAmounts.value[product.id] = 5;
            }
        });
    } catch (requestError) {
        error.value = "No se pudo conectar con el servidor.";
    } finally {
        loading.value = false;
    }
}

function buttonText(product) {
    if (!user.value) {
        return "Inicia sesion para comprar";
    }

    if (product.stock <= 0) {
        return "Sin stock";
    }

    if (buyingId.value === product.id) {
        return "Comprando...";
    }

    return "Comprar";
}

function canRestock(product) {
    if (!user.value) {
        return false;
    }

    const roles = user.value.roles || [];
    return roles.includes("ADMIN") || product.vendedorId === user.value.id;
}

async function restockProduct(product) {
    const cantidad = Number(restockAmounts.value[product.id] || 0);

    if (cantidad < 1) {
        message.value = "La cantidad a reponer tiene que ser mayor a 0.";
        messageError.value = true;
        return;
    }

    restockingId.value = product.id;
    message.value = "";
    messageError.value = false;

    try {
        const response = await fetch("/api/productos/" + product.id + "/stock", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({
                cantidad: cantidad
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.value = data.mensaje || "No se pudo reponer stock.";
            messageError.value = true;
            return;
        }

        message.value = "Stock actualizado para " + data.producto.titulo + ".";
        await loadProducts();
    } catch (requestError) {
        message.value = "No se pudo conectar con el servidor.";
        messageError.value = true;
    } finally {
        restockingId.value = null;
    }
}

async function buyProduct(product) {
    if (!user.value) {
        message.value = "Tenes que iniciar sesion para comprar.";
        messageError.value = true;
        return;
    }

    buyingId.value = product.id;
    message.value = "";
    messageError.value = false;

    try {
        const response = await fetch("/api/ordenes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({
                productoId: product.id,
                cantidad: 1
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.value = data.mensaje || "No se pudo realizar la compra.";
            messageError.value = true;
            return;
        }

        message.value = "Compra realizada. Orden #" + data.orden.id + ".";
        await loadProducts();
    } catch (requestError) {
        message.value = "No se pudo conectar con el servidor.";
        messageError.value = true;
    } finally {
        buyingId.value = null;
    }
}

onMounted(loadProducts);

watch(function() {
    return route.query.categoria;
}, loadProducts);
</script>
