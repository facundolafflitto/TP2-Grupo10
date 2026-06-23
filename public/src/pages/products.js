(function() {
    App.loadProducts = async function() {
        App.elements.productGrid.innerHTML = `<div class="empty">Cargando productos...</div>`;

        try {
            const params = new URLSearchParams();

            if (App.state.selectedCategory) {
                params.set("categoria", App.state.selectedCategory);
            }

            const query = params.toString();
            App.state.products = await App.requestJson("/api/productos" + (query ? "?" + query : ""));
            App.renderProducts();
        } catch (error) {
            App.elements.productGrid.innerHTML = `<div class="empty">${error.message}</div>`;
        }
    };

    App.canManageProduct = function(product) {
        if (!App.state.user) {
            return false;
        }

        const roles = App.state.user.roles || [];
        return roles.includes("ADMIN") || (roles.includes("USUARIO") && product.vendedorId === App.state.user.id);
    };

    App.renderProducts = function() {
        if (App.state.products.length === 0) {
            App.elements.productGrid.innerHTML = `<div class="empty">No hay productos para mostrar.</div>`;
            return;
        }

        App.elements.productGrid.innerHTML = App.state.products.map(function(product) {
            const image = product.imagenUrl
                ? `<img src="${product.imagenUrl}" alt="${product.titulo}">`
                : `<strong>${product.titulo.slice(0, 1)}</strong>`;
            const disabledBuy = !App.canBuy() || product.stock <= 0 ? "disabled" : "";
            const manageActions = App.canManageProduct(product) ? `
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
                        <span class="price">$ ${App.formatPrice(product.precio)}</span>
                        <p>Vendedor: <strong>${product.vendedor}</strong></p>
                    </div>
                    <div class="product-actions">
                        <button class="button primary" type="button" data-cart-add="${product.id}" ${disabledBuy}>
                            ${App.canBuy() ? product.stock > 0 ? "Agregar al carrito" : "Sin stock" : "Inicia sesion"}
                        </button>
                        ${manageActions}
                    </div>
                </article>
            `;
        }).join("");
    };

    App.editProduct = function(productId) {
        const product = App.state.products.find(function(item) {
            return item.id === productId;
        });

        if (!product) {
            return;
        }

        App.elements.productForm.elements.id.value = product.id;
        App.elements.productForm.elements.titulo.value = product.titulo;
        App.elements.productForm.elements.categoriaId.value = product.categoriaId;
        App.elements.productForm.elements.precio.value = product.precio;
        App.elements.productForm.elements.stock.value = product.stock;
        App.elements.productForm.elements.imagenUrl.value = product.imagenUrl || "";
        App.elements.productForm.elements.descripcion.value = product.descripcion || "";
        App.elements.productForm.classList.remove("hidden");
    };

    App.deleteProduct = async function(productId) {
        try {
            await App.requestJson("/api/productos/" + productId, {
                method: "DELETE",
                headers: App.authHeaders()
            });

            App.showToast("Producto eliminado.");
            App.loadProducts();
        } catch (error) {
            App.showToast(error.message, true);
        }
    };

    App.restockProduct = async function(productId) {
        const input = document.querySelector(`[data-restock-input="${productId}"]`);
        const cantidad = Number(input.value || 0);

        try {
            await App.requestJson("/api/productos/" + productId + "/stock", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...App.authHeaders()
                },
                body: JSON.stringify({ cantidad: cantidad })
            });

            App.showToast("Stock actualizado.");
            App.loadProducts();
        } catch (error) {
            App.showToast(error.message, true);
        }
    };

    App.saveProduct = async function(event) {
        event.preventDefault();

        const formData = new FormData(App.elements.productForm);
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
            await App.requestJson(productId ? "/api/productos/" + productId : "/api/productos", {
                method: productId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...App.authHeaders()
                },
                body: JSON.stringify(body)
            });

            App.elements.productForm.reset();
            App.elements.productForm.classList.add("hidden");
            App.showToast("Producto guardado.");
            App.loadProducts();
        } catch (error) {
            App.showToast(error.message, true);
        }
    };
})();
