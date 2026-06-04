<script setup lang="ts">

import Button from "@/components/ui/Button.vue";
</script>

<template>
  <div id="start-screen" class="screen" style="display: block;">
    <div class="container">
      <h1 class="h1 _text-center">Виселица</h1>
      <router-link
          :to="{name: 'select-themes'}"
      >

        <Button class="btn" >Играть</Button>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.screen {
  align-content: center;
  height: 100%;
}
.screen .container {
  height: 30svh;
  display: flex;
  align-items: center;
  justify-content: start;
  flex-direction: column;
  gap: 3rem;
}
.start-page {
  height: 100%;
}

.btn {
  font-size: 30px;
}
</style>