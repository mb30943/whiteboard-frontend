<template>
  <div class="login-container" v-if="!loggedIn">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>

  <!-- ✅ Show Whiteboard after login -->
  <WhiteboardView v-else />
</template>

<script>
import WhiteboardView from './Whiteboard.vue'

export default {
  name: 'LoginView',
  components: {
    WhiteboardView
  },
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loggedIn: false
    };
  },
  methods: {
    async handleLogin() {
      this.error = '';
      try {
        const res = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.token);

        // ✅ Switch to Whiteboard view
        this.loggedIn = true;

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