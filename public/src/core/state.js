const App = {
    state: {
        products: [],
        categories: [],
        cart: JSON.parse(localStorage.getItem("carrito") || "[]"),
        selectedCategory: "",
        user: JSON.parse(localStorage.getItem("usuarioActual") || "null"),
        token: localStorage.getItem("authToken") || ""
    },
    elements: {
        routes: {
            inicio: document.getElementById("inicio"),
            productos: document.getElementById("view-productos"),
            carrito: document.getElementById("view-carrito"),
            login: document.getElementById("view-login"),
            registro: document.getElementById("view-registro"),
            ordenes: document.getElementById("view-ordenes")
        },
        productGrid: document.getElementById("productGrid"),
        categoryFilters: document.getElementById("categoryFilters"),
        orderList: document.getElementById("orderList"),
        cartList: document.getElementById("cartList"),
        cartCount: document.getElementById("cartCount"),
        categoryForm: document.getElementById("categoryForm"),
        homeProductCount: document.getElementById("homeProductCount"),
        homeCategoryCount: document.getElementById("homeCategoryCount"),
        homeCartCount: document.getElementById("homeCartCount"),
        homeFeaturedProducts: document.getElementById("homeFeaturedProducts"),
        toast: document.getElementById("toast"),
        productForm: document.getElementById("productForm"),
        registerRole: document.getElementById("registerRole"),
        adminCodeField: document.getElementById("adminCodeField")
    },
    normalizeStoredUser: function() {
        if (!this.state.user || !Array.isArray(this.state.user.roles)) {
            return;
        }

        const hasLegacyUserRole = this.state.user.roles.includes("COMPRADOR") || this.state.user.roles.includes("VENDEDOR");

        if (hasLegacyUserRole && !this.state.user.roles.includes("USUARIO")) {
            this.state.user.roles = this.state.user.roles.filter(function(role) {
                return role !== "COMPRADOR" && role !== "VENDEDOR";
            });
            this.state.user.roles.push("USUARIO");
            localStorage.setItem("usuarioActual", JSON.stringify(this.state.user));
        }
    },
    userHasRole: function(role) {
        const roles = this.state.user ? this.state.user.roles || [] : [];
        return roles.includes(role);
    },
    canBuy: function() {
        return this.userHasRole("USUARIO") || this.userHasRole("ADMIN");
    },
    canSell: function() {
        return this.userHasRole("USUARIO") || this.userHasRole("ADMIN");
    },
    isAdmin: function() {
        return this.userHasRole("ADMIN");
    },
    authHeaders: function() {
        return this.state.token ? { Authorization: "Bearer " + this.state.token } : {};
    },
    showToast: function(message, isError) {
        this.elements.toast.textContent = message;
        this.elements.toast.classList.toggle("error", Boolean(isError));
        this.elements.toast.classList.remove("hidden");
        window.setTimeout(function() {
            App.elements.toast.classList.add("hidden");
        }, 3200);
    },
    formatPrice: function(value) {
        return Number(value).toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },
    requestJson: async function(url, options) {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "No se pudo completar la accion");
        }

        return data;
    }
};

App.elements.categorySelect = App.elements.productForm.elements.categoriaId;
