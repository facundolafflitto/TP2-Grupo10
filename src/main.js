import { createApp } from "vue";
import App from "./App.vue";
import router from "./vueRouter";
import "./assets/styles.css";

createApp(App).use(router).mount("#app");
