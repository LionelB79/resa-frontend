import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import WeekRoomView from "../views/WeekRoomView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/weekRoomView",
    name: "weekRoomView",
    component: WeekRoomView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
