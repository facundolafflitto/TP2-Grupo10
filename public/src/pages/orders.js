(function() {
    App.loadOrders = async function() {
        App.elements.orderList.innerHTML = `<div class="empty">Cargando ordenes...</div>`;

        try {
            const orders = await App.requestJson("/api/ordenes", {
                headers: App.authHeaders()
            });

            if (orders.length === 0) {
                App.elements.orderList.innerHTML = `<div class="empty">Todavia no hay ordenes.</div>`;
                return;
            }

            App.elements.orderList.innerHTML = orders.map(function(order) {
                const details = order.detalles.map(function(detail) {
                    return `${detail.cantidad} x ${detail.producto}`;
                }).join(", ");

                return `
                    <article class="order-card">
                        <h3>Orden #${order.id}</h3>
                        <p>Estado: <strong>${order.estado}</strong></p>
                        <p>Total: <strong>$ ${App.formatPrice(order.total)}</strong></p>
                        <p>${details}</p>
                    </article>
                `;
            }).join("");
        } catch (error) {
            App.elements.orderList.innerHTML = `<div class="empty">${error.message}</div>`;
        }
    };
})();
