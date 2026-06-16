import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ProductsView from "../views/ProductsView.vue";
import OrdersView from "../views/OrdersView.vue";

const routes = [
    { path: "/", name: "home", component: HomeView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/registro", name: "registro", component: RegisterView },
    { path: "/productos", name: "productos", component: ProductsView },
    { path: "/ordenes", name: "ordenes", component: OrdersView }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
