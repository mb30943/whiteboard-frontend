<template>
  <div>
    <!-- Existing Canvas and Tools -->
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
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { io } from 'socket.io-client';


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
};




const draw = (e) => {
  if (!drawing.value) return;


  const newX = e.offsetX;
  const newY = e.offsetY;


  // Draw segment on local canvas
  ctx.beginPath();
  ctx.moveTo(lastX.value, lastY.value);
  ctx.lineTo(newX, newY);
  ctx.strokeStyle = color.value;
  ctx.lineWidth = lineWidth.value;
  ctx.stroke();
  ctx.closePath();


  // Emit segment data to server
  emitDrawing({
    startX: lastX.value,
    startY: lastY.value,
    endX: newX,
    endY: newY,
    color: color.value,
    lineWidth: lineWidth.value
  });


  // Update last point
  lastX.value = newX;
  lastY.value = newY;
};




const stopDrawing = () => {
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




onMounted(() => {
  ctx = canvas.value.getContext('2d');
});
</script>
 


<style scoped>
canvas {
  border: 1px solid #ccc;
}


/* ✅ Share Button and Modal Styles - NEW ADDITION */
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