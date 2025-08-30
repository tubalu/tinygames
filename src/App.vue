<template>
  <div id="app">
    <Minesweeper />
  </div>
</template>

<script setup lang="ts">
import Minesweeper from './components/Minesweeper.vue'
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 11px;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>
