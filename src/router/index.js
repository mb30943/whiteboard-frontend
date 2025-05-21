import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../components/LoginView.vue';
import WhiteboardView from '../components/Whiteboard.vue'; 
import RoomSelectionView from '../components/RoomSelectionView.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginView },
    { path: '/dashboard', name: 'Home', component: RoomSelectionView },
  { path: '/whiteBoards/:id', name: 'Dashboard', component: WhiteboardView , props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
