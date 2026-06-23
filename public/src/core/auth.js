(function() {
    App.login = async function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        try {
            const data = await App.requestJson("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.get("email"),
                    password: formData.get("password")
                })
            });

            App.state.user = data.usuario;
            App.state.token = data.token;
            localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));
            localStorage.setItem("authToken", data.token);
            App.syncAuthUi();
            window.location.hash = "productos";
            App.showToast("Sesion iniciada.");
        } catch (error) {
            App.showToast(error.message, true);
        }
    };

    App.register = async function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        try {
            await App.requestJson("/api/auth/register", {
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
            App.showToast("Usuario registrado. Ya podes iniciar sesion.");
        } catch (error) {
            App.showToast(error.message, true);
        }
    };

    App.logout = function() {
        App.state.user = null;
        App.state.token = "";
        App.state.cart = [];
        localStorage.removeItem("usuarioActual");
        localStorage.removeItem("authToken");
        localStorage.removeItem("carrito");
        App.elements.productForm.classList.add("hidden");
        App.syncAuthUi();
        window.location.hash = "inicio";
    };
})();
