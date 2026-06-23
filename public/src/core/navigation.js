(function() {
    App.syncAuthUi = function() {
        document.querySelectorAll("[data-auth-link]").forEach(function(element) {
            element.classList.toggle("hidden", !App.state.user);
        });

        document.querySelectorAll("[data-guest-link]").forEach(function(element) {
            element.classList.toggle("hidden", Boolean(App.state.user));
        });

        document.querySelectorAll("[data-user-link]").forEach(function(element) {
            element.classList.toggle("hidden", !App.canBuy());
        });

        document.querySelectorAll("[data-admin-link]").forEach(function(element) {
            element.classList.toggle("hidden", !App.isAdmin());
        });

        if (!App.canSell()) {
            App.elements.productForm.classList.add("hidden");
        }

        App.updateCartCount();
    };

    App.navigate = function() {
        const route = window.location.hash.replace("#", "") || "inicio";

        Object.keys(App.elements.routes).forEach(function(key) {
            App.elements.routes[key].classList.toggle("active", key === route);
        });

        if (route === "productos") {
            App.loadProducts();
            App.loadCategories();
        }

        if (route === "inicio") {
            App.loadHomeData();
        }

        if (route === "ordenes") {
            if (!App.canBuy()) {
                window.location.hash = "login";
                App.showToast("Necesitas iniciar sesion para ver ordenes.", true);
                return;
            }

            App.loadOrders();
        }

        if (route === "carrito") {
            if (!App.canBuy()) {
                window.location.hash = "productos";
                App.showToast("Necesitas iniciar sesion para usar el carrito.", true);
                return;
            }

            App.renderCart();
        }
    };
})();
