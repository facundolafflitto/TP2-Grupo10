(function() {
    App.loadHomeData = async function() {
        try {
            const productos = await App.requestJson("/api/productos");
            const categorias = await App.requestJson("/api/categorias");

            App.elements.homeProductCount.textContent = productos.length;
            App.elements.homeCategoryCount.textContent = categorias.length;
            App.elements.homeCartCount.textContent = App.state.cart.reduce(function(total, item) {
                return total + item.cantidad;
            }, 0);

            App.renderHomeFeaturedProducts(productos.slice(0, 4));
        } catch (error) {
            App.elements.homeFeaturedProducts.innerHTML = `<div class="empty">No se pudieron cargar los productos destacados.</div>`;
        }
    };

    App.renderHomeFeaturedProducts = function(products) {
        if (products.length === 0) {
            App.elements.homeFeaturedProducts.innerHTML = `<div class="empty">Todavia no hay productos publicados.</div>`;
            return;
        }

        App.elements.homeFeaturedProducts.innerHTML = products.map(function(product) {
            const image = product.imagenUrl
                ? `<img src="${product.imagenUrl}" alt="${product.titulo}">`
                : `<strong>${product.titulo.slice(0, 1)}</strong>`;

            return `
                <article class="featured-product">
                    <div>${image}</div>
                    <span>${product.categoria}</span>
                    <h3>${product.titulo}</h3>
                    <p>$ ${App.formatPrice(product.precio)}</p>
                </article>
            `;
        }).join("");
    };
})();
