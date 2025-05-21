<template>
  <nav class="navbar" >
    <div class="navbar-left">
      <router-link to="/" class="logo">Whiteboard App</router-link>
    </div>
    <div class="navbar-right">
      <button @click="goToDashboard" class="dashboard-button">Dashboard</button>
      <button @click="logout" class="logout-button">Logout</button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const route = useRoute()  // <-- here

const shouldShowNavbar = computed(() => {
    console.log('ddsdd',route.name);
  return route.name
})


function logout() {
  signOut(auth).then(() => {
    router.push('/')
  }).catch((error) => {
    console.error('Logout error:', error)
  })
}

function goToDashboard() {
  // If you want to store a boardId or similar, get it here.
  // For demo, just navigate to a fixed route:
  router.push('/dashboard')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  background-color: #2c3e50;
  padding: 1rem;
  color: white;
}

.logo {
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.dashboard-button {
  background-color: #3498db; /* blue */
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.dashboard-button:hover {
  background-color: #2980b9;
}

.logout-button {
  background-color: #e74c3c;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.logout-button:hover {
  background-color: #c0392b;
}
</style>
