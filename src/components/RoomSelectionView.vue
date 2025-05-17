<template>
  <div class="room-selection">
    <h2>Join or Create a Room</h2>

    <div>
      <input v-model="joinRoomId" placeholder="Enter room ID to join" />
      <button @click="joinRoom">Join Room</button>
    </div>

    <div>
      <input v-model="newRoomName" placeholder="Enter a name for new room" />
      <button @click="createRoom">Create Room</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      joinRoomId: '',
      newRoomName: '',
      error: '',
    };
  },
  methods: {
    async createRoom() {
      this.error = '';
      try {
        const userId = localStorage.getItem('user_id'); // assume you store logged in user id
        const res = await fetch('http://localhost:3000/api/boards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.newRoomName, user_id: userId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create room');
        this.$emit('roomSelected', data.id);
      } catch (err) {
        this.error = err.message;
      }
    },
    joinRoom() {
      if (!this.joinRoomId.trim()) {
        this.error = 'Please enter a room ID';
        return;
      }
      this.$emit('roomSelected', this.joinRoomId.trim());
    },
  },
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
