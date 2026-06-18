const state = {
    products: [],
    categories: [],
    cart: JSON.parse(localStorage.getItem("carrito") || "[]"),
    selectedCategory: "",
    user: JSON.parse(localStorage.getItem("usuarioActual") || "null"),
    token: localStorage.getItem("authToken") || ""
};

function normalizeStoredUser() {
    if (!state.user || !Array.isArray(state.user.roles)) {
        return;
    }

    const hasLegacyUserRole = state.user.roles.includes("COMPRADOR") || state.user.roles.includes("VENDEDOR");

    if (hasLegacyUserRole && !state.user.roles.includes("USUARIO")) {
        state.user.roles = state.user.roles.filter(function(role) {
            return role !== "COMPRADOR" && role !== "VENDEDOR";
        });
        state.user.roles.push("USUARIO");
        localStorage.setItem("usuarioActual", JSON.stringify(state.user));
    }
}

const routes = {
    inicio: document.getElementById("inicio"),
    productos: document.getElementById("view-productos"),
    carrito: document.getElementById("view-carrito"),
    login: document.getElementById("view-login"),
    registro: document.getElementById("view-registro"),
    ordenes: document.getElementById("view-ordenes")
};

const productGrid = document.getElementById("productGrid");
const categoryFilters = document.getElementById("categoryFilters");
const orderList = document.getElementById("orderList");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
const productForm = document.getElementById("productForm");
const categorySelect = productForm.elements.categoriaId;
const registerRole = document.getElementById("registerRole");
const adminCodeField = document.getElementById("adminCodeField");

function userHasRole(role) {
    const roles = state.user ? state.user.roles || [] : [];
    return roles.includes(role);
}

function canBuy() {
    return userHasRole("USUARIO") || userHasRole("ADMIN");
}

function canSell() {
    return userHasRole("USUARIO") || userHasRole("ADMIN");
}

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

    document.querySelectorAll("[data-user-link]").forEach(function(element) {
        element.classList.toggle("hidden", !canBuy());
    });

    if (!canSell()) {
        productForm.classList.add("hidden");
    }

    updateCartCount();
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
        if (!canBuy()) {
            window.location.hash = "login";
            showToast("Necesitas iniciar sesion para ver ordenes.", true);
            return;
        }

        loadOrders();
    }

    if (route === "carrito") {
        if (!canBuy()) {
            window.location.hash = "productos";
            showToast("Necesitas iniciar sesion para usar el carrito.", true);
            return;
        }

        renderCart();
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
    return roles.includes("ADMIN") || (roles.includes("USUARIO") && product.vendedorId === state.user.id);
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
        const disabledBuy = !canBuy() || product.stock <= 0 ? "disabled" : "";
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
                    <button class="button primary" type="button" data-cart-add="${product.id}" ${disabledBuy}>
                        ${canBuy() ? product.stock > 0 ? "Agregar al carrito" : "Sin stock" : "Inicia sesion"}
                    </button>
                    ${manageActions}
                </div>
            </article>
        `;
    }).join("");
}

function saveCart() {
    localStorage.setItem("carrito", JSON.stringify(state.cart));
    updateCartCount();
}

function updateCartCount() {
    const total = state.cart.reduce(function(acumulado, item) {
        return acumulado + item.cantidad;
    }, 0);

    cartCount.textContent = total;
}

function addToCart(productId) {
    if (!canBuy()) {
        showToast("Necesitas iniciar sesion para comprar.", true);
        return;
    }

    const product = state.products.find(function(item) {
        return item.id === productId;
    });

    if (!product || product.stock <= 0) {
        showToast("Producto sin stock.", true);
        return;
    }

    const cartItem = state.cart.find(function(item) {
        return item.productoId === productId;
    });

    if (cartItem) {
        cartItem.cantidad += 1;
    } else {
        state.cart.push({
            productoId: product.id,
            titulo: product.titulo,
            precio: Number(product.precio),
            stock: product.stock,
            cantidad: 1
        });
    }

    saveCart();
    showToast("Producto agregado al carrito.");
}

function renderCart() {
    if (state.cart.length === 0) {
        cartList.innerHTML = `<div class="empty">El carrito esta vacio.</div>`;
        return;
    }

    const total = state.cart.reduce(function(acumulado, item) {
        return acumulado + item.precio * item.cantidad;
    }, 0);

    cartList.innerHTML = state.cart.map(function(item) {
        return `
            <article class="cart-card">
                <div>
                    <h3>${item.titulo}</h3>
                    <p>$ ${formatPrice(item.precio)} c/u</p>
                </div>
                <div class="quantity-control">
                    <button class="button secondary" type="button" data-cart-dec="${item.productoId}">-</button>
                    <input type="number" min="1" value="${item.cantidad}" data-cart-qty="${item.productoId}">
                    <button class="button secondary" type="button" data-cart-inc="${item.productoId}">+</button>
                </div>
                <button class="button secondary" type="button" data-cart-remove="${item.productoId}">Quitar</button>
            </article>
        `;
    }).join("") + `<div class="order-card"><h3>Total: $ ${formatPrice(total)}</h3></div>`;
}

function updateCartItem(productId, cantidad) {
    const item = state.cart.find(function(cartItem) {
        return cartItem.productoId === productId;
    });

    if (!item) {
        return;
    }

    item.cantidad = Math.max(1, Number(cantidad) || 1);
    saveCart();
    renderCart();
}

function removeCartItem(productId) {
    state.cart = state.cart.filter(function(item) {
        return item.productoId !== productId;
    });
    saveCart();
    renderCart();
}

async function checkoutCart() {
    if (state.cart.length === 0) {
        showToast("El carrito esta vacio.", true);
        return;
    }

    try {
        const data = await requestJson("/api/ordenes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({
                items: state.cart.map(function(item) {
                    return {
                        productoId: item.productoId,
                        cantidad: item.cantidad
                    };
                })
            })
        });

        showToast("Compra realizada. Orden #" + data.orden.id + ".");
        state.cart = [];
        saveCart();
        renderCart();
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
                password: formData.get("password"),
                rol: formData.get("rol"),
                adminCode: formData.get("adminCode")
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
    state.cart = [];
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("authToken");
    localStorage.removeItem("carrito");
    productForm.classList.add("hidden");
    syncAuthUi();
    window.location.hash = "inicio";
}

document.getElementById("loginForm").addEventListener("submit", login);
document.getElementById("registerForm").addEventListener("submit", register);
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("checkoutButton").addEventListener("click", checkoutCart);
registerRole.addEventListener("change", function() {
    adminCodeField.classList.toggle("hidden", registerRole.value !== "ADMIN");
});
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
cartList.addEventListener("click", function(event) {
    const incrementId = event.target.dataset.cartInc;
    const decrementId = event.target.dataset.cartDec;
    const removeId = event.target.dataset.cartRemove;

    if (incrementId) {
        const item = state.cart.find(function(cartItem) {
            return cartItem.productoId === Number(incrementId);
        });
        updateCartItem(Number(incrementId), item.cantidad + 1);
    }

    if (decrementId) {
        const item = state.cart.find(function(cartItem) {
            return cartItem.productoId === Number(decrementId);
        });
        updateCartItem(Number(decrementId), item.cantidad - 1);
    }

    if (removeId) {
        removeCartItem(Number(removeId));
    }
});

cartList.addEventListener("change", function(event) {
    const quantityId = event.target.dataset.cartQty;

    if (quantityId) {
        updateCartItem(Number(quantityId), event.target.value);
    }
});

categoryFilters.addEventListener("click", function(event) {
    if (!event.target.matches("[data-category]")) {
        return;
    }

    state.selectedCategory = event.target.dataset.category;
    renderCategories();
    loadProducts();
});

productGrid.addEventListener("click", function(event) {
    const cartAddId = event.target.dataset.cartAdd;
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;
    const restockId = event.target.dataset.restock;

    if (cartAddId) {
        addToCart(Number(cartAddId));
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
normalizeStoredUser();
syncAuthUi();
navigate();
