<template>
  <div class="deck-grid">
    <DeckCard v-for="deck in decks" :key="deck.id" :deck="deck" />
  </div>
</template>

<script setup lang="ts">
import DeckCard from './DeckCard.vue'
import type { DeckMetadata } from '../utils/deckLoader'

interface Props {
  decks: DeckMetadata[]
}

defineProps<Props>()
</script>

<style scoped>
.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}
</style>
