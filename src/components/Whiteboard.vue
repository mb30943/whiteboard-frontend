<template>
  <div>
    <!-- Existing Canvas and Tools -->
     <button @click="undo">Undo</button>
<button @click="redo">Redo</button>

    <canvas ref="canvas" width="800" height="600"
      @mousedown="startDrawing"
      @mouseup="stopDrawing"
      @mousemove="draw"
      class="border"></canvas>
     
    <div class="tools">
      <input type="color" v-model="color" />
      <input type="range" min="1" max="10" v-model="lineWidth" />
    </div>


    <!-- ✅ Share Link Button and Modal - NEW ADDITION -->
    <button @click="showModal = true" class="share-button">
      Share Link
    </button>


    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Share this Whiteboard</h3>
        <input type="text" :value="shareLink" readonly />
        <button @click="copyToClipboard">Copy</button>
        <button @click="showModal = false">Close</button>
      </div>
    </div>
    <!-- Save Button -->
<button @click="saveBoard" class="save-button">
  Save Board
</button>

  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { io } from 'socket.io-client';
import { db } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";


const canvas = ref(null);
const drawing = ref(false);
const color = ref('#000000');
const lineWidth = ref(2);
let ctx;
let socket;
const lastX = ref(0);
const lastY = ref(0);


const route = useRoute();
const boardId = route.params.id;

const drawingHistory = ref([]); 
const redoStack = ref([]);
let currentStroke = []; 



// ✅ Share Modal Logic - NEW ADDITION
const showModal = ref(false);
const shareLink = `${window.location.origin}/whiteBoards/${boardId}`;


const copyToClipboard = () => {
  navigator.clipboard.writeText(shareLink).then(() => {
    alert("Link copied to clipboard!");
  });
};


onMounted(() => {
  ctx = canvas.value.getContext('2d');


  socket = io('http://192.168.0.104:3000');


  socket.emit('join-room', boardId);


  socket.on('draw', (data) => {
    drawFromServer(data);
  });
socket.on('room-users', (users) => {
  console.log('Users in the room:', users);
  // Update UI accordingly
});
  
});


onBeforeUnmount(() => {
  if (socket) socket.disconnect();
});


const emitDrawing = (payload) => {
  socket.emit('draw', { roomId: boardId, data: payload });
};

const startDrawing = (e) => {
  drawing.value = true;
  lastX.value = e.offsetX;
  lastY.value = e.offsetY;
  currentStroke = [];
};

const saveBoard = async () => {
  try {
    const userId = localStorage.getItem('user_id');
    const docRef = doc(db, "boards", boardId);
    const boardSnap = await getDoc(docRef);

    let updatedParticipants = [userId];

    if (boardSnap.exists()) {
      const boardData = boardSnap.data();
      const existing = boardData.participants || [];

      if (!existing.includes(userId)) {
        updatedParticipants = [...existing, userId];
      } else {
        updatedParticipants = existing;
      }
    }


    await setDoc(docRef, {
       data:  drawingHistory.value.flat(),
      updatedAt: new Date(),
      participants: updatedParticipants
    }, { merge: true });

    console.log("Participants updated!");
  } catch (error) {
    console.error("Error updating participants:", error);
  }
};


const loadBoard = async () => {
  try {
    const docRef = doc(db, "boards", boardId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const savedData = docSnap.data().data;
      drawingHistory.value = savedData || [];
      redrawAll();
    } else {
      console.log("No such board!");
    }
  } catch (error) {
    console.error("Error loading board:", error);
  }
};
onMounted(async () => {
  ctx = canvas.value.getContext('2d');
  socket = io('http://192.168.0.104:3000');
  socket.emit('join-room', boardId);
  socket.on('draw', (data) => drawFromServer(data));
  await loadBoard(); 
});

const drawSegment = ({ startX, startY, endX, endY, color, lineWidth }) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.closePath();
};


const draw = (e) => {
  if (!drawing.value) return;

  const newX = e.offsetX;
  const newY = e.offsetY;

  const segment = {
    startX: lastX.value,
    startY: lastY.value,
    endX: newX,
    endY: newY,
    color: color.value,
    lineWidth: lineWidth.value
  };

  drawSegment(segment);
  emitDrawing(segment);
  currentStroke.push(segment); 

  lastX.value = newX;
  lastY.value = newY;
};





const stopDrawing = () => {
  if (currentStroke.length > 0) {
    drawingHistory.value.push(currentStroke); 
    redoStack.value = [];
  }
  drawing.value = false;
};



const drawFromServer = ({ startX, startY, endX, endY, color, lineWidth }) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.closePath();
};


const undo = () => {
  if (drawingHistory.value.length === 0) return;

  const lastStroke = drawingHistory.value.pop(); 
  redoStack.value.push(lastStroke);

  redrawAll();

  socket.emit('undo', { roomId: boardId });
};

const redo = () => {
  if (redoStack.value.length === 0) return;

  const stroke = redoStack.value.pop();
  drawingHistory.value.push(stroke);

  stroke.forEach(segment => drawSegment(segment));

  socket.emit('redo', { roomId: boardId, stroke });
};


const redrawAll = () => {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  drawingHistory.value.forEach(stroke => {
      drawSegment(stroke);
  });
};





onMounted(() => {
  ctx = canvas.value.getContext('2d');
  socket.on('undo', () => {
  if (drawingHistory.value.length === 0) return;
  const lastStroke = drawingHistory.value.pop(); 
  redoStack.value.push(lastStroke);
  redrawAll();
});

socket.on('redo', (stroke) => {
  if (!stroke || !Array.isArray(stroke)) return;
  drawingHistory.value.push(stroke);
  stroke.forEach(segment => drawSegment(segment));
});

});
</script>
 


<style scoped>
canvas {
  border: 1px solid #ccc;
}
.save-button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.share-button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}


.modal {
  background: white;
  padding: 24px;
  border-radius: 10px;
  text-align: center;
  width: 300px;
}


.modal input {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
}


</style>