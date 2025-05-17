import { createApp } from 'vue'
import './style.css'
// @ts-ignore
import Router from "./router/index.js"
import App from './App.vue'  

const app = createApp(App)
app.use(Router) 
app.mount('#app')
