import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(router).use(pinia).mount("#app");
