<template>
  <article class="card-highlight" @click="navigateToDeck" :class="{ 'card-highlight--clickable': deckUrl !== '#' }">

    <!-- Image with #1e293b overlay that fades on hover -->
    <div class="card-highlight__image">
      <img
        :src="thumbnailUrl"
        :alt="`${deck.title} preview`"
        @error="onImageError"
        :class="{ 'card-highlight__image-hidden': imgError }"
      />
      <div v-if="imgError" class="card-highlight__image-fallback" />
      <div class="card-highlight__image-overlay" />
    </div>

    <!-- Title -->
    <h3 class="card-highlight__title">{{ deck.title }}</h3>

    <!-- Meta — cta-info__item style -->
    <div class="card-info">
      <span class="card-info__item">⏱ {{ deck.duration }}</span>
      <span class="card-info__separator">•</span>
      <span class="card-info__item">🌐 {{ deck.language.toUpperCase() }}</span>
    </div>

    <!-- Description -->
    <p class="card-highlight__description">{{ deck.description }}</p>

    <!-- Tags — deep-stack-services__badge style -->
    <div class="card-highlight__features">
      <span v-for="tag in deck.tags.slice(0, 4)" :key="tag" class="card-highlight__tag">{{ tag }}</span>
      <span v-if="deck.tags.length > 4" class="card-highlight__tag card-highlight__tag--more">
        +{{ deck.tags.length - 4 }}
      </span>
    </div>

  </article>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { DeckMetadata } from '../utils/deckLoader'
import { getDeckUrl, getThumbnailUrl } from '../utils/deckLoader'

interface Props {
  deck: DeckMetadata
}

const props = defineProps<Props>()
const deckUrl = ref<string>('#')
const imgError = ref(false)

const thumbnailUrl = computed(() => getThumbnailUrl(props.deck.id, props.deck.thumbnail))

onMounted(async () => {
  deckUrl.value = await getDeckUrl(props.deck.id)
})

function onImageError() {
  imgError.value = true
}

function navigateToDeck(event: MouseEvent) {
  if (deckUrl.value === '#') return
  if (event.ctrlKey || event.metaKey) {
    window.open(deckUrl.value, '_blank')
  } else {
    window.location.href = deckUrl.value
  }
}
</script>

<style scoped>
/* ─── card-highlight — exact replica of maxime-lenne.fr ───── */

.card-highlight {
  position: relative;
  background: var(--ml-surface, #ffffff);
  border: 1px solid var(--ml-border, #e2e8f0);
  border-radius: 20px;
  padding: 0;           /* image flush to top, content has its own padding */
  overflow: hidden;
  text-align: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode — matches site's computed rgb(30,41,59) = #1e293b */
:global(html.dark) .card-highlight {
  background: #1e293b;
  border-color: #334155;
}

/* 1px centred gradient line that fades in on hover — exact site behaviour */
.card-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
}

.card-highlight--clickable { cursor: pointer; }

.card-highlight--clickable:hover {
  transform: translateY(-8px);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 40px;
  border-color: rgba(59, 130, 246, 0.2);
}

:global(html.dark) .card-highlight--clickable:hover {
  box-shadow: rgba(0, 0, 0, 0.3) 0px 20px 40px;
}

.card-highlight--clickable:hover::before { opacity: 1; }

/* ─── Image with #1e293b overlay ─────────────────────────── */

.card-highlight__image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.card-highlight__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-highlight__image-hidden { visibility: hidden; }

/* Gradient fallback when no thumbnail */
.card-highlight__image-fallback {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--ml-color-primary, #2563eb) 0%, var(--ml-color-secondary, #10b981) 100%);
}

/* Opaque #1e293b overlay — disappears on hover */
.card-highlight__image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(30, 41, 59, 0.82);
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-highlight--clickable:hover .card-highlight__image-overlay { opacity: 0; }
.card-highlight--clickable:hover .card-highlight__image img { transform: scale(1.05); }

/* ─── Content area ───────────────────────────────────────── */

.card-highlight__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ml-text-primary, #0f172a);
  margin: 1.25rem 1.5rem 0.25rem;
  letter-spacing: -0.01em;
  line-height: 1.3;
  /* no gradient — matches site */
  background: none;
  -webkit-text-fill-color: unset;
}

/* ─── Meta — cta-info style ──────────────────────────────── */

.card-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--ml-text-tertiary, #94a3b8);
  margin: 0.4rem 1.5rem 0;
}

.card-info__item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-info__separator {
  opacity: 0.5;
  font-size: 16px;
  line-height: 1;
}

/* ─── Description ────────────────────────────────────────── */

.card-highlight__description {
  font-size: 0.825rem;
  line-height: 1.6;
  color: var(--ml-text-secondary, #64748b);
  margin: 0.6rem 1.5rem 0;
}

/* ─── Tags — deep-stack-services__badge style ────────────── */

.card-highlight__features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 1rem 1.5rem 1.5rem;
  margin-top: 0.75rem;
}

.card-highlight__tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: var(--ml-background-alt, #f8fafc);
  color: var(--ml-text-secondary, #64748b);
  border: 1px solid var(--ml-border, #e2e8f0);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background 0.2s;
}

:global(html.dark) .card-highlight__tag {
  background: rgba(59, 130, 246, 0.15);
  color: var(--ml-color-primary-dark, #3b82f6);
}

.card-highlight__tag--more {
  background: rgba(100, 116, 139, 0.1);
  color: var(--ml-text-tertiary, #94a3b8);
}

.card-highlight--clickable:hover .card-highlight__tag {
  background: rgba(37, 99, 235, 0.14);
}
</style>
