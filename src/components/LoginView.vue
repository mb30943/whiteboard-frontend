<template>
  <!-- LOGIN FORM -->
  <div class="login-container" v-if="!loggedIn && !isRegistering">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <p>Don't have an account? 
      <button @click="isRegistering = true">Create one</button>
    </p>
  </div>

  <!-- REGISTER FORM -->
  <RegisterView
    v-else-if="isRegistering"
    @registered="handleRegistered"
    @switchToLogin="isRegistering = false"
  />

  <!-- ROOM SELECTION VIEW AFTER LOGIN/REGISTER -->
  <RoomSelectionView
    v-else-if="showRoomSelection"
    @enterRoom="handleEnterRoom"
  />
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase'; 
import WhiteboardView from './Whiteboard.vue';
import RegisterView from './RegisterView.vue';
import RoomSelectionView from './RoomSelectionView.vue';

export default {
  name: 'LoginView',
  components: {
    WhiteboardView,
    RegisterView,
    RoomSelectionView
  },
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loggedIn: false,
      isRegistering: false,
      showRoomSelection: false,
      roomId: null
    };
  },
  methods: {
    async handleLogin() {
      this.error = '';
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

         await fetch('http://localhost:3000/api/syncUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.uid, email: user.email }),
        });
        // Store Firebase UID in localStorage
        localStorage.setItem('user_id', user.uid);

        this.loggedIn = true;
        this.showRoomSelection = true;
      } catch (err) {
        this.error = err.message;
      }
    },
    handleRegistered() {
      this.loggedIn = true;
      this.isRegistering = false;
      this.showRoomSelection = true;
    },
    handleEnterRoom(selectedRoomId) {
      this.roomId = selectedRoomId;
      this.showRoomSelection = false;
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
}
input, button {
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
}
button {
  background-color: #4CAF50;
  color: white;
  border: none;
}
.error {
  color: red;
}
</style>