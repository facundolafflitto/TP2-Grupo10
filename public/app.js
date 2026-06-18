const state = {
    products: [],
    categories: [],
    selectedCategory: "",
    user: JSON.parse(localStorage.getItem("usuarioActual") || "null"),
    token: localStorage.getItem("authToken") || ""
};

const routes = {
    inicio: document.getElementById("inicio"),
    productos: document.getElementById("view-productos"),
    login: document.getElementById("view-login"),
    registro: document.getElementById("view-registro"),
    ordenes: document.getElementById("view-ordenes")
};

const productGrid = document.getElementById("productGrid");
const categoryFilters = document.getElementById("categoryFilters");
const orderList = document.getElementById("orderList");
const toast = document.getElementById("toast");
const productForm = document.getElementById("productForm");
const categorySelect = productForm.elements.categoriaId;

function authHeaders() {
    return state.token ? { Authorization: "Bearer " + state.token } : {};
}

function showToast(message, isError) {
    toast.textContent = message;
    toast.classList.toggle("error", Boolean(isError));
    toast.classList.remove("hidden");
    window.setTimeout(function() {
        toast.classList.add("hidden");
    }, 3200);
}

function formatPrice(value) {
    return Number(value).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function syncAuthUi() {
    document.querySelectorAll("[data-auth-link]").forEach(function(element) {
        element.classList.toggle("hidden", !state.user);
    });

    document.querySelectorAll("[data-guest-link]").forEach(function(element) {
        element.classList.toggle("hidden", Boolean(state.user));
    });
}

function navigate() {
    const route = window.location.hash.replace("#", "") || "inicio";

    Object.keys(routes).forEach(function(key) {
        routes[key].classList.toggle("active", key === route);
    });

    if (route === "productos") {
        loadProducts();
        loadCategories();
    }

    if (route === "ordenes") {
        if (!state.user) {
            window.location.hash = "login";
            showToast("Tenes que iniciar sesion para ver tus ordenes.", true);
            return;
        }

        loadOrders();
    }
}

async function requestJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo completar la accion");
    }

    return data;
}

async function loadCategories() {
    try {
        state.categories = await requestJson("/api/categorias");
        renderCategories();
        fillCategorySelect();
    } catch (error) {
        showToast(error.message, true);
    }
}

function renderCategories() {
    const chips = [
        `<button class="filter-chip ${state.selectedCategory ? "" : "active"}" type="button" data-category="">Todos</button>`
    ];

    state.categories.forEach(function(category) {
        const active = state.selectedCategory === category.nombre ? "active" : "";
        chips.push(`<button class="filter-chip ${active}" type="button" data-category="${category.nombre}">${category.nombre}</button>`);
    });

    categoryFilters.innerHTML = chips.join("");
}

function fillCategorySelect() {
    categorySelect.innerHTML = state.categories.map(function(category) {
        return `<option value="${category.id}">${category.nombre}</option>`;
    }).join("");
}

async function loadProducts() {
    productGrid.innerHTML = `<div class="empty">Cargando productos...</div>`;

    try {
        const params = new URLSearchParams();

        if (state.selectedCategory) {
            params.set("categoria", state.selectedCategory);
        }

        const query = params.toString();
        state.products = await requestJson("/api/productos" + (query ? "?" + query : ""));
        renderProducts();
    } catch (error) {
        productGrid.innerHTML = `<div class="empty">${error.message}</div>`;
    }
}

function canManageProduct(product) {
    if (!state.user) {
        return false;
    }

    const roles = state.user.roles || [];
    return roles.includes("ADMIN") || product.vendedorId === state.user.id;
}

function renderProducts() {
    if (state.products.length === 0) {
        productGrid.innerHTML = `<div class="empty">No hay productos para mostrar.</div>`;
        return;
    }

    productGrid.innerHTML = state.products.map(function(product) {
        const image = product.imagenUrl
            ? `<img src="${product.imagenUrl}" alt="${product.titulo}">`
            : `<strong>${product.titulo.slice(0, 1)}</strong>`;
        const disabledBuy = !state.user || product.stock <= 0 ? "disabled" : "";
        const manageActions = canManageProduct(product) ? `
            <div class="inline-actions">
                <button class="button secondary" type="button" data-edit="${product.id}">Editar</button>
                <button class="button secondary" type="button" data-delete="${product.id}">Eliminar</button>
            </div>
            <div class="restock-row">
                <input type="number" min="1" value="5" data-restock-input="${product.id}">
                <button class="button secondary" type="button" data-restock="${product.id}">Reponer</button>
            </div>
        ` : "";

        return `
            <article class="product-card">
                <div class="product-visual">${image}</div>
                <div class="product-body">
                    <div class="product-meta">
                        <span>${product.categoria}</span>
                        <span class="stock ${product.stock <= 3 ? "low" : ""}">Stock ${product.stock}</span>
                    </div>
                    <h3>${product.titulo}</h3>
                    <p>${product.descripcion || "Sin descripcion."}</p>
                    <span class="price">$ ${formatPrice(product.precio)}</span>
                    <p>Vendedor: <strong>${product.vendedor}</strong></p>
                </div>
                <div class="product-actions">
                    <button class="button primary" type="button" data-buy="${product.id}" ${disabledBuy}>
                        ${state.user ? product.stock > 0 ? "Comprar" : "Sin stock" : "Inicia sesion para comprar"}
                    </button>
                    ${manageActions}
                </div>
            </article>
        `;
    }).join("");
}

async function buyProduct(productId) {
    try {
        const data = await requestJson("/api/ordenes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({ productoId: productId, cantidad: 1 })
        });

        showToast("Compra realizada. Orden #" + data.orden.id + ".");
        loadProducts();
    } catch (error) {
        showToast(error.message, true);
    }
}

function editProduct(productId) {
    const product = state.products.find(function(item) {
        return item.id === productId;
    });

    if (!product) {
        return;
    }

    productForm.elements.id.value = product.id;
    productForm.elements.titulo.value = product.titulo;
    productForm.elements.categoriaId.value = product.categoriaId;
    productForm.elements.precio.value = product.precio;
    productForm.elements.stock.value = product.stock;
    productForm.elements.imagenUrl.value = product.imagenUrl || "";
    productForm.elements.descripcion.value = product.descripcion || "";
    productForm.classList.remove("hidden");
}

async function deleteProduct(productId) {
    try {
        await requestJson("/api/productos/" + productId, {
            method: "DELETE",
            headers: authHeaders()
        });

        showToast("Producto eliminado.");
        loadProducts();
    } catch (error) {
        showToast(error.message, true);
    }
}

async function restockProduct(productId) {
    const input = document.querySelector(`[data-restock-input="${productId}"]`);
    const cantidad = Number(input.value || 0);

    try {
        await requestJson("/api/productos/" + productId + "/stock", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({ cantidad: cantidad })
        });

        showToast("Stock actualizado.");
        loadProducts();
    } catch (error) {
        showToast(error.message, true);
    }
}

async function saveProduct(event) {
    event.preventDefault();

    const formData = new FormData(productForm);
    const productId = formData.get("id");
    const body = {
        titulo: formData.get("titulo"),
        categoriaId: Number(formData.get("categoriaId")),
        precio: Number(formData.get("precio")),
        stock: Number(formData.get("stock")),
        imagenUrl: formData.get("imagenUrl"),
        descripcion: formData.get("descripcion")
    };

    try {
        await requestJson(productId ? "/api/productos/" + productId : "/api/productos", {
            method: productId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(body)
        });

        productForm.reset();
        productForm.classList.add("hidden");
        showToast("Producto guardado.");
        loadProducts();
    } catch (error) {
        showToast(error.message, true);
    }
}

async function loadOrders() {
    orderList.innerHTML = `<div class="empty">Cargando ordenes...</div>`;

    try {
        const orders = await requestJson("/api/ordenes", {
            headers: authHeaders()
        });

        if (orders.length === 0) {
            orderList.innerHTML = `<div class="empty">Todavia no hay ordenes.</div>`;
            return;
        }

        orderList.innerHTML = orders.map(function(order) {
            const details = order.detalles.map(function(detail) {
                return `${detail.cantidad} x ${detail.producto}`;
            }).join(", ");

            return `
                <article class="order-card">
                    <h3>Orden #${order.id}</h3>
                    <p>Estado: <strong>${order.estado}</strong></p>
                    <p>Total: <strong>$ ${formatPrice(order.total)}</strong></p>
                    <p>${details}</p>
                </article>
            `;
        }).join("");
    } catch (error) {
        orderList.innerHTML = `<div class="empty">${error.message}</div>`;
    }
}

async function login(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        const data = await requestJson("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: formData.get("email"),
                password: formData.get("password")
            })
        });

        state.user = data.usuario;
        state.token = data.token;
        localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));
        localStorage.setItem("authToken", data.token);
        syncAuthUi();
        window.location.hash = "productos";
        showToast("Sesion iniciada.");
    } catch (error) {
        showToast(error.message, true);
    }
}

async function register(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
        await requestJson("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: formData.get("nombre"),
                email: formData.get("email"),
                password: formData.get("password")
            })
        });

        event.target.reset();
        window.location.hash = "login";
        showToast("Usuario registrado. Ya podes iniciar sesion.");
    } catch (error) {
        showToast(error.message, true);
    }
}

function logout() {
    state.user = null;
    state.token = "";
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("authToken");
    productForm.classList.add("hidden");
    syncAuthUi();
    window.location.hash = "inicio";
}

document.getElementById("loginForm").addEventListener("submit", login);
document.getElementById("registerForm").addEventListener("submit", register);
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("toggleProductForm").addEventListener("click", function() {
    productForm.reset();
    productForm.elements.id.value = "";
    productForm.classList.toggle("hidden");
});
document.getElementById("cancelProductEdit").addEventListener("click", function() {
    productForm.reset();
    productForm.classList.add("hidden");
});
productForm.addEventListener("submit", saveProduct);

categoryFilters.addEventListener("click", function(event) {
    if (!event.target.matches("[data-category]")) {
        return;
    }

    state.selectedCategory = event.target.dataset.category;
    renderCategories();
    loadProducts();
});

productGrid.addEventListener("click", function(event) {
    const buyId = event.target.dataset.buy;
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    const restockId = event.target.dataset.restock;

    if (buyId) {
        buyProduct(Number(buyId));
    }

    if (editId) {
        editProduct(Number(editId));
    }

    if (deleteId) {
        deleteProduct(Number(deleteId));
    }

    if (restockId) {
        restockProduct(Number(restockId));
    }
});

window.addEventListener("hashchange", navigate);
syncAuthUi();
navigate();
