(function() {
    App.saveCart = function() {
        localStorage.setItem("carrito", JSON.stringify(App.state.cart));
        App.updateCartCount();
    };

    App.updateCartCount = function() {
        const total = App.state.cart.reduce(function(acumulado, item) {
            return acumulado + item.cantidad;
        }, 0);

        App.elements.cartCount.textContent = total;
        App.elements.homeCartCount.textContent = total;
    };

    App.addToCart = function(productId) {
        if (!App.canBuy()) {
            App.showToast("Necesitas iniciar sesion para comprar.", true);
            return;
        }

        const product = App.state.products.find(function(item) {
            return item.id === productId;
        });

        if (!product || product.stock <= 0) {
            App.showToast("Producto sin stock.", true);
            return;
        }

        const cartItem = App.state.cart.find(function(item) {
            return item.productoId === productId;
        });

        if (cartItem) {
            cartItem.cantidad += 1;
        } else {
            App.state.cart.push({
                productoId: product.id,
                titulo: product.titulo,
                precio: Number(product.precio),
                stock: product.stock,
                cantidad: 1
            });
        }

        App.saveCart();
        App.showToast("Producto agregado al carrito.");
    };

    App.renderCart = function() {
        if (App.state.cart.length === 0) {
            App.elements.cartList.innerHTML = `<div class="empty">El carrito esta vacio.</div>`;
            return;
        }

        const total = App.state.cart.reduce(function(acumulado, item) {
            return acumulado + item.precio * item.cantidad;
        }, 0);

        App.elements.cartList.innerHTML = App.state.cart.map(function(item) {
            return `
                <article class="cart-card">
                    <div>
                        <h3>${item.titulo}</h3>
                        <p>$ ${App.formatPrice(item.precio)} c/u</p>
                    </div>
                    <div class="quantity-control">
                        <button class="button secondary" type="button" data-cart-dec="${item.productoId}">-</button>
                        <input type="number" min="1" value="${item.cantidad}" data-cart-qty="${item.productoId}">
                        <button class="button secondary" type="button" data-cart-inc="${item.productoId}">+</button>
                    </div>
                    <button class="button secondary" type="button" data-cart-remove="${item.productoId}">Quitar</button>
                </article>
            `;
        }).join("") + `<div class="order-card"><h3>Total: $ ${App.formatPrice(total)}</h3></div>`;
    };

    App.updateCartItem = function(productId, cantidad) {
        const item = App.state.cart.find(function(cartItem) {
            return cartItem.productoId === productId;
        });

        if (!item) {
            return;
        }

        item.cantidad = Math.max(1, Number(cantidad) || 1);
        App.saveCart();
        App.renderCart();
    };

    App.removeCartItem = function(productId) {
        App.state.cart = App.state.cart.filter(function(item) {
            return item.productoId !== productId;
        });
        App.saveCart();
        App.renderCart();
    };

    App.checkoutCart = async function() {
        if (App.state.cart.length === 0) {
            App.showToast("El carrito esta vacio.", true);
            return;
        }

        try {
            const data = await App.requestJson("/api/ordenes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...App.authHeaders()
                },
                body: JSON.stringify({
                    items: App.state.cart.map(function(item) {
                        return {
                            productoId: item.productoId,
                            cantidad: item.cantidad
                        };
                    })
                })
            });

            App.showToast("Compra realizada. Orden #" + data.orden.id + ".");
            App.state.cart = [];
            App.saveCart();
            App.renderCart();
            App.loadProducts();
        } catch (error) {
            App.showToast(error.message, true);
        }
    };
})();
