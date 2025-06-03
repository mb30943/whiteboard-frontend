<template>
  <nav class="navbar" v-if="userId">
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

const router = useRouter()
const userId = ref(localStorage.getItem('user_id'))

let checkInterval = null

onMounted(() => {
  checkInterval = setInterval(() => {
    const storedId = localStorage.getItem('user_id')
    if (userId.value !== storedId) {
      userId.value = storedId
    }
  }, 500)
})

onUnmounted(() => {
  clearInterval(checkInterval)
})

watch(userId, (newVal) => {
  if (!newVal) {
    console.log('User ID is null, redirecting to login...')
    router.push('/')
      window.location.reload()
      localStorage.removeItem('username')
  }
})

function logout() {
  signOut(auth)
    .then(() => {
      localStorage.removeItem('user_id')
      userId.value = null
    })
    .catch((error) => {
      console.error('Logout error:', error)
    })
}

function goToDashboard() {
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
  background-color: #3498db;
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
