<script setup lang="ts">
// Image-left layout - image on left, content on right
</script>

<template>
  <div class="slidev-layout image-left">
    <div class="image-container flex items-center justify-center">
      <slot name="image" />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>
