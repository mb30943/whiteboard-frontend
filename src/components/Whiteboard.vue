<template>
    <div>
      <canvas ref="canvas" width="800" height="600"
        @mousedown="startDrawing"
        @mouseup="stopDrawing"
        @mousemove="draw"
        class="border"></canvas>
      <div class="tools">
        <input type="color" v-model="color" />
        <input type="range" min="1" max="10" v-model="lineWidth" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const canvas = ref(null);
  const drawing = ref(false);
  const color = ref('#000000');
  const lineWidth = ref(2);
  let ctx;
  
  const socket = new WebSocket("ws://localhost:8080/ws");
  
  // Handle incoming drawing data
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'draw') {
      drawFromServer(data.payload);
    }
  };
  
  const emitDrawing = (payload) => {
    socket.send(JSON.stringify({ type: 'draw', payload }));
  };
  
  const startDrawing = (e) => {
    drawing.value = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  };
  
  const draw = (e) => {
    if (!drawing.value) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = color.value;
    ctx.lineWidth = lineWidth.value;
    ctx.stroke();
    emitDrawing({ x: e.offsetX, y: e.offsetY, color: color.value, lineWidth: lineWidth.value });
  };
  
  const stopDrawing = () => {
    drawing.value = false;
  };
  
  const drawFromServer = ({ x, y, color, lineWidth }) => {
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };
  
  onMounted(() => {
    ctx = canvas.value.getContext('2d');
  });
  </script>
  
  
  <style scoped>
  canvas {
    border: 1px solid #ccc;
  }
  </style>
  