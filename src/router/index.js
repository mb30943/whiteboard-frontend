import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../components/LoginView.vue';
import WhiteboardView from '../components/Whiteboard.vue'; // Create this later

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/WhiteboardView', name: 'Dashboard', component: WhiteboardView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
