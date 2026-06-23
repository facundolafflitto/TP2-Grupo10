(function() {
    App.loadCategories = async function() {
        try {
            App.state.categories = await App.requestJson("/api/categorias");
            App.renderCategories();
            App.fillCategorySelect();
        } catch (error) {
            App.showToast(error.message, true);
        }
    };

    App.renderCategories = function() {
        const chips = [
            `<button class="filter-chip ${App.state.selectedCategory ? "" : "active"}" type="button" data-category="">Todos</button>`
        ];

        App.state.categories.forEach(function(category) {
            const active = App.state.selectedCategory === category.nombre ? "active" : "";
            chips.push(`<button class="filter-chip ${active}" type="button" data-category="${category.nombre}">${category.nombre}</button>`);
        });

        App.elements.categoryFilters.innerHTML = chips.join("");
    };

    App.fillCategorySelect = function() {
        App.elements.categorySelect.innerHTML = App.state.categories.map(function(category) {
            return `<option value="${category.id}">${category.nombre}</option>`;
        }).join("");
    };

    App.createCategory = async function(event) {
        event.preventDefault();

        const formData = new FormData(App.elements.categoryForm);

        try {
            await App.requestJson("/api/categorias", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...App.authHeaders()
                },
                body: JSON.stringify({
                    nombre: formData.get("nombre")
                })
            });

            App.elements.categoryForm.reset();
            App.showToast("Categoria creada.");
            await App.loadCategories();
            await App.loadHomeData();
        } catch (error) {
            App.showToast(error.message, true);
        }
    };
})();
