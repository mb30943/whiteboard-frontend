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
      <div class="drawings-grid">
        <div
          class="drawing-card"
          v-for="drawing in drawings"
          :key="drawing.id"
           @click="handleDrawingClick(drawing.id)"
        >
          {{ drawing.boardName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc,addDoc ,serverTimestamp } from "firebase/firestore";

export default {
  data() {
    return {
      joinRoomId: '',
      newRoomName: '',
      error: '',
      drawings: []
    };
  },
  async mounted() {
    try {
      const userId = localStorage.getItem('user_id');
      const snapshot = await getDocs(collection(db, 'boards'));
      console.log('this.drawings',snapshot.docs);

      this.drawings = snapshot.docs
        .filter(doc => {
          const data = doc.data();
          const participants = data.participants || [];
          return participants.includes(userId);
        })
         .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: `Board ${doc.id.substring(0, 5)}`,
          boardName: data.name || 'Untitled Board', 
    };
  });
    } catch (err) {
      this.error = 'Failed to load boards: ' + err.message;
    }
  },
  methods: {
    
    async createRoom() {
        this.error = '';
        try {
          const userId = localStorage.getItem('user_id');
         const docRef = await addDoc(collection(db, 'boards'), {
            name: this.newRoomName,
            id: userId,
            created_at: serverTimestamp(),
            participants: [userId],
          });
          this.$router.push({ path: `/whiteBoards/${docRef.id}` });
        } catch (err) {
          this.error = err.message;
        }
    },

    handleDrawingClick(boardId) {
        let username = localStorage.getItem('username');

        if (!username) {
          username = prompt('Enter your username to join the board:');
          if (!username) {
            alert('Username is required to join the room');
            return;
          }
          localStorage.setItem('username', username);
        }

        this.$router.push(`/whiteBoards/${boardId}`);
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

.drawings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}

.drawing-card {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.drawing-card:hover {
  transform: scale(1.03);
}

.card-link {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
  font-size: 1rem;
}

.card-link:hover {
  text-decoration: underline;
}
</style>
