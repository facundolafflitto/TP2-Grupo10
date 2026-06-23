(function() {
    App.init = function() {
        document.getElementById("loginForm").addEventListener("submit", App.login);
        document.getElementById("registerForm").addEventListener("submit", App.register);
        document.getElementById("logoutButton").addEventListener("click", App.logout);
        document.getElementById("checkoutButton").addEventListener("click", App.checkoutCart);
        App.elements.categoryForm.addEventListener("submit", App.createCategory);

        App.elements.registerRole.addEventListener("change", function() {
            App.elements.adminCodeField.classList.toggle("hidden", App.elements.registerRole.value !== "ADMIN");
        });

        document.getElementById("toggleProductForm").addEventListener("click", function() {
            App.elements.productForm.reset();
            App.elements.productForm.elements.id.value = "";
            App.elements.productForm.classList.toggle("hidden");
        });

        document.getElementById("cancelProductEdit").addEventListener("click", function() {
            App.elements.productForm.reset();
            App.elements.productForm.classList.add("hidden");
        });

        App.elements.productForm.addEventListener("submit", App.saveProduct);

        App.elements.cartList.addEventListener("click", function(event) {
            const incrementId = event.target.dataset.cartInc;
            const decrementId = event.target.dataset.cartDec;
            const removeId = event.target.dataset.cartRemove;

            if (incrementId) {
                const item = App.state.cart.find(function(cartItem) {
                    return cartItem.productoId === Number(incrementId);
                });
                App.updateCartItem(Number(incrementId), item.cantidad + 1);
            }

            if (decrementId) {
                const item = App.state.cart.find(function(cartItem) {
                    return cartItem.productoId === Number(decrementId);
                });
                App.updateCartItem(Number(decrementId), item.cantidad - 1);
            }

            if (removeId) {
                App.removeCartItem(Number(removeId));
            }
        });

        App.elements.cartList.addEventListener("change", function(event) {
            const quantityId = event.target.dataset.cartQty;

            if (quantityId) {
                App.updateCartItem(Number(quantityId), event.target.value);
            }
        });

        App.elements.categoryFilters.addEventListener("click", function(event) {
            if (!event.target.matches("[data-category]")) {
                return;
            }

            App.state.selectedCategory = event.target.dataset.category;
            App.renderCategories();
            App.loadProducts();
        });

        App.elements.productGrid.addEventListener("click", function(event) {
            const cartAddId = event.target.dataset.cartAdd;
            const editId = event.target.dataset.edit;
            const deleteId = event.target.dataset.delete;
            const restockId = event.target.dataset.restock;

            if (cartAddId) {
                App.addToCart(Number(cartAddId));
            }

            if (editId) {
                App.editProduct(Number(editId));
            }

            if (deleteId) {
                App.deleteProduct(Number(deleteId));
            }

            if (restockId) {
                App.restockProduct(Number(restockId));
            }
        });

        window.addEventListener("hashchange", App.navigate);
        App.normalizeStoredUser();
        App.syncAuthUi();
        App.navigate();
    };
})();
