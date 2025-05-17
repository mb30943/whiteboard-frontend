import { createApp } from 'vue'
import './style.css'
// @ts-ignore
import Router from "./router/index.js"
import LoginView from './components/LoginView.vue'
const app = createApp(LoginView)
app.use(Router) 
app.mount('#app')
