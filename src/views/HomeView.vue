<template>
    <main class="home-page">
        <section class="store-hero">
            <div class="store-hero-copy">
                <p class="eyebrow">Ofertas seleccionadas</p>
                <h1>Encontra productos para todos los dias en un solo lugar.</h1>
                <p class="intro">
                    Tecnologia, hogar y accesorios con stock actualizado, vendedores activos y compras simples.
                </p>

                <div class="search-panel" role="search">
                    <input type="search" placeholder="Buscar productos, categorias o vendedores">
                    <RouterLink class="button primary" to="/productos">Buscar</RouterLink>
                </div>

                <div class="hero-stats">
                    <div>
                        <strong>3</strong>
                        <span>Categorias</span>
                    </div>
                    <div>
                        <strong>24h</strong>
                        <span>Operacion diaria</span>
                    </div>
                    <div>
                        <strong>Stock</strong>
                        <span>Visible antes de comprar</span>
                    </div>
                </div>
            </div>

            <div class="showcase">
                <article class="showcase-main">
                    <span class="tag">Mas buscado</span>
                    <h2>Auriculares Wireless</h2>
                    <p>Audio comodo para trabajar, estudiar o viajar.</p>
                    <div class="showcase-price">
                        <span>Desde</span>
                        <strong>$ 59.999</strong>
                    </div>
                </article>

                <div class="showcase-stack">
                    <RouterLink to="/productos?categoria=Accesorios">
                        <span>Accesorios</span>
                        <strong>Mochila urbana</strong>
                    </RouterLink>
                    <RouterLink to="/productos?categoria=Hogar">
                        <span>Hogar</span>
                        <strong>Lampara de escritorio</strong>
                    </RouterLink>
                    <RouterLink to="/productos?categoria=Tecnologia">
                        <span>Tecnologia</span>
                        <strong>Productos con stock</strong>
                    </RouterLink>
                </div>
            </div>
        </section>

        <section class="home-section">
            <div class="home-section-heading">
                <div>
                    <p class="eyebrow">Comprar rapido</p>
                    <h2>Categorias populares</h2>
                </div>
                <RouterLink class="text-link" to="/productos">Ver catalogo</RouterLink>
            </div>

            <div class="category-grid">
                <RouterLink class="category-card" to="/productos?categoria=Tecnologia">
                    <span>T</span>
                    <div>
                        <h3>Tecnologia</h3>
                        <p>Audio, dispositivos y accesorios para el dia a dia.</p>
                    </div>
                </RouterLink>
                <RouterLink class="category-card" to="/productos?categoria=Accesorios">
                    <span>A</span>
                    <div>
                        <h3>Accesorios</h3>
                        <p>Complementos utiles para moverte mejor.</p>
                    </div>
                </RouterLink>
                <RouterLink class="category-card" to="/productos?categoria=Hogar">
                    <span>H</span>
                    <div>
                        <h3>Hogar</h3>
                        <p>Objetos practicos para espacios de trabajo y casa.</p>
                    </div>
                </RouterLink>
            </div>
        </section>

        <section class="home-section muted-band">
            <div class="home-section-heading">
                <div>
                    <p class="eyebrow">Experiencia</p>
                    <h2>Compra clara desde el primer clic</h2>
                </div>
            </div>

            <div class="benefit-grid">
                <article class="benefit-card">
                    <h3>Stock visible</h3>
                    <p>Sabes cuantas unidades hay antes de confirmar la compra.</p>
                </article>
                <article class="benefit-card">
                    <h3>Ordenes simples</h3>
                    <p>Cada compra queda registrada con producto, cantidad y total.</p>
                </article>
                <article class="benefit-card">
                    <h3>Vendedores activos</h3>
                    <p>Los productos se muestran con su vendedor y categoria.</p>
                </article>
            </div>
        </section>
    </main>
</template>
