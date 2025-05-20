<template>
  <div class="container">
    <!-- Top bar -->
    <div class="top-bar">
      <div class="room-controls">
        <input v-model="joinRoomId" placeholder="Enter room ID to join" />
        <button @click="joinRoom">Join Room</button>

        <input v-model="newRoomName" placeholder="Enter a name for new room" />
        <button @click="createRoom">Create Room</button>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="error">{{ error }}</p>

    <!-- Main content area -->
    <div class="drawings-list">
      <h3>Previously Saved Drawings</h3>
      <ul>
        <li v-for="drawing in drawings" :key="drawing.id" class="drawing-item">
          <router-link :to="`/whiteBoards/${drawing.id}`">{{ drawing.name }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      joinRoomId: '',
      newRoomName: '',
      error: '',
      drawings: []
    };
  },
  mounted() {
    // Load saved drawings from localStorage
    const savedDrawings = JSON.parse(localStorage.getItem('saved_drawings')) || [];
    this.drawings = savedDrawings;
  },
  methods: {
    async createRoom() {
      this.error = '';
      try {
        const userId = localStorage.getItem('user_id');
        const res = await fetch('http://localhost:3000/api/boards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.newRoomName,
            user_id: userId
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create room');

        this.$router.push({ path: `/whiteBoards/${data.id}` });
      } catch (err) {
        this.error = err.message;
      }
    },
    joinRoom() {
      this.error = '';
      if (!this.joinRoomId.trim()) {
        this.error = 'Please enter a room link or ID';
        return;
      }

      let roomId = this.joinRoomId.trim();
      if (roomId.includes('whiteBoards/')) {
        const parts = roomId.split('/');
        roomId = parts[parts.length - 1];
      }

      if (!roomId) {
        this.error = 'Invalid room link';
        return;
      }

      this.$router.push(`/whiteBoards/${roomId}`);
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ccc;
}

.room-controls {
  display: flex;
  gap: 0.5rem;
}

.room-controls input {
  padding: 0.5rem;
  font-size: 1rem;
}

.room-controls button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.error {
  color: red;
  padding: 0 1rem;
}

.drawings-list {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.drawing-item {
  margin-bottom: 0.5rem;
}

.drawing-item a {
  text-decoration: none;
  color: #007bff;
}

.drawing-item a:hover {
  text-decoration: underline;
}
</style>
