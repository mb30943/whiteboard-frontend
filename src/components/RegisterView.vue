<template>
  <div class="login-container">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <p>Already have an account? 
      <button @click="$emit('switchToLogin')">Login</button>
    </p>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase'; 

export default {
  name: 'RegisterView',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async handleRegister() {
      this.error = '';
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        await fetch('http://localhost:3000/api/syncUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.uid, email: user.email }),
          });


        localStorage.setItem('user_id', user.uid);
        this.$emit('registered');
      } catch (err) {
        this.error = err.message;
      }
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