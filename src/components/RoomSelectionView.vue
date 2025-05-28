<template>
  <div class="container">
    <!-- Top bar -->
    <div class="top-bar">
      <div class="room-controls">
        <input v-model="joinRoomId" placeholder="Enter room ID to join" />
        <button @click="openJoinModal">Join Room</button>

        <input v-model="newRoomName" placeholder="Enter a name for new room" />
        <button @click="createRoom">Create Room</button>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="error">{{ error }}</p>

    <!-- Join Room Modal -->
    <div v-if="showJoinModal" class="modal-backdrop" @click.self="closeJoinModal">
      <div class="modal">
        <h3>Join Room</h3>
        <input v-model="modalRoomId" placeholder="Room ID" />
        <input v-model="modalUsername" placeholder="Your name" />
        <div class="modal-buttons">
          <button @click="submitJoinRoom">Join</button>
          <button @click="closeJoinModal">Cancel</button>
        </div>
        <p v-if="modalError" class="error">{{ modalError }}</p>
      </div>
    </div>

    <!-- Main content area -->
    <div class="drawings-list">
      <h3>Previously Saved Drawings</h3>
      <div class="drawings-grid">
        <div
          class="drawing-card"
          v-for="drawing in drawings"
          :key="drawing.id"
        >
          <router-link :to="`/whiteBoards/${drawing.id}`" class="card-link">
            {{ drawing.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { io } from "socket.io-client";

export default {
  data() {
    return {
      joinRoomId: "",
      newRoomName: "",
      error: "",
      drawings: [],

      // Modal state
      showJoinModal: false,
      modalRoomId: "",
      modalUsername: "",
      modalError: "",

      socket: null,
    };
  },
  async mounted() {
    try {
      const userId = localStorage.getItem("user_id");
      const snapshot = await getDocs(collection(db, "boards"));
      this.drawings = snapshot.docs
        .filter((doc) => {
          const data = doc.data();
          const participants = data.participants || [];
          return participants.includes(userId);
        })
        .map((doc) => ({
          id: doc.id,
          name: `Board ${doc.id.substring(0, 5)}`,
        }));
    } catch (err) {
      this.error = "Failed to load boards: " + err.message;
    }
  },
  methods: {
    async createRoom() {
      this.error = "";
      try {
        const userId = localStorage.getItem("user_id");
        const res = await fetch("http://localhost:3000/api/boards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.newRoomName,
            user_id: userId,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create room");

        this.$router.push({ path: `/whiteBoards/${data.id}` });
      } catch (err) {
        this.error = err.message;
      }
    },

    openJoinModal() {
      this.modalRoomId = this.joinRoomId.trim();
      this.modalUsername = localStorage.getItem("username") || "";
      this.modalError = "";
      this.showJoinModal = true;
    },

    closeJoinModal() {
      this.showJoinModal = false;
      this.modalError = "";
    },

    submitJoinRoom() {
      if (!this.modalRoomId) {
        this.modalError = "Room ID is required.";
        return;
      }
      if (!this.modalUsername) {
        this.modalError = "Username is required.";
        return;
      }

      // Save username to localStorage
      localStorage.setItem("username", this.modalUsername);

      // Setup socket connection here or pass this info to the next page
      // If you want to handle socket inside this component:
      this.socket = io("http://192.168.0.104:3000");

      this.socket.emit("join-room", {
        roomId: this.modalRoomId,
        username: this.modalUsername,
      });

      // You can add socket listeners here, or pass the socket instance via a global store

      this.showJoinModal = false;

      // Navigate to room page
      this.$router.push(`/whiteBoards/${this.modalRoomId}`);
    },
  },
};
</script>

<style scoped>
/* Existing styles omitted for brevity */

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal input {
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.error {
  color: red;
}
</style>
