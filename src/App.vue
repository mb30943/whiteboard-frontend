<template>
  <div id="app">
    <NavigationBar />
    <router-view />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import NavigationBar from './../src/components/NavigationBar.vue'

const route = useRoute()

</script>
