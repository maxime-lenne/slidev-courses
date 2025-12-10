<script setup lang="ts">
// Image-right layout - content on left, image on right
</script>

<template>
  <div class="slidev-layout image-right">
    <div class="content">
      <slot />
    </div>
    <div class="image-container flex items-center justify-center">
      <slot name="image" />
    </div>
  </div>
</template>
