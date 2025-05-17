import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../components/LoginView.vue';
import WhiteboardView from '../components/Whiteboard.vue'; // Create this later

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/whiteBoards/:id', name: 'Dashboard', component: WhiteboardView , props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
