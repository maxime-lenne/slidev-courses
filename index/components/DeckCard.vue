<template>
  <article class="card-highlight" @click="navigateToDeck" :class="{ 'card-highlight--clickable': deckUrl !== '#' }">
    <div class="card-highlight__icon">{{ deckIcon }}</div>
    <h3 class="card-highlight__title">{{ deck.title }}</h3>
    <div class="card-highlight__keywords">{{ deck.tags.slice(0, 3).join(', ') }}</div>
    <p class="card-highlight__description">{{ deck.description }}</p>
    <div class="card-highlight__features">
      <span class="card-highlight__badge">⏱ {{ deck.duration }}</span>
      <span class="card-highlight__badge">{{ deck.language.toUpperCase() }}</span>
      <span v-if="deck.tags.length > 3" class="card-highlight__badge card-highlight__badge--more">
        +{{ deck.tags.length - 3 }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { DeckMetadata } from '../utils/deckLoader'
import { getDeckUrl } from '../utils/deckLoader'

interface Props {
  deck: DeckMetadata
}

const props = defineProps<Props>()
const deckUrl = ref<string>('#')

onMounted(async () => {
  deckUrl.value = await getDeckUrl(props.deck.id)
})

const ICON_MAP: Record<string, string> = {
  sql: '🗃️', database: '🗃️', postgresql: '🗃️', mysql: '🗃️',
  python: '🐍',
  langchain: '🤖', ai: '🤖', 'machine learning': '🤖', genai: '🤖', llm: '🤖',
  javascript: '💻', typescript: '💻', vue: '💻', react: '💻',
  git: '🌿', github: '🌿',
  docker: '🐳', devops: '🐳',
  html: '🌐', css: '🎨',
}

const deckIcon = computed(() => {
  const tags = props.deck.tags.map(t => t.toLowerCase())
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (tags.some(t => t.includes(key))) return icon
  }
  return '📊'
})

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
/* ── card-highlight — replicates maxime-lenne.fr ───────── */

.card-highlight {
  position: relative;
  background: var(--ml-surface, #ffffff);
  border: 1px solid var(--ml-border, #e2e8f0);
  border-radius: 12px;
  padding: 2rem 1.75rem;
  text-align: center;
  overflow: hidden;
  transition: transform var(--ml-transition-normal, 250ms ease-in-out),
              box-shadow var(--ml-transition-normal, 250ms ease-in-out),
              border-color var(--ml-transition-normal, 250ms ease-in-out);
}

/* 4px gradient top border — exact replica of card-highlight::before */
.card-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--ml-gradient-primary, linear-gradient(135deg, #2563eb 0%, #10b981 100%));
  border-radius: 12px 12px 0 0;
}

.card-highlight--clickable {
  cursor: pointer;
}

.card-highlight--clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--ml-shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1));
  border-color: var(--ml-border-hover, #cbd5e1);
}

/* ── Content ─────────────────────────────────────────────── */

.card-highlight__icon {
  font-size: 2.25rem;
  line-height: 1;
  margin-bottom: 1rem;
  filter: grayscale(0.1);
}

.card-highlight__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  /* gradient text applied by theme's colors.css */
  background: var(--ml-gradient-text, linear-gradient(135deg, #2563eb 0%, #10b981 100%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}

.card-highlight__keywords {
  font-size: 0.8rem;
  font-style: italic;
  color: var(--ml-text-secondary, #64748b);
  margin-bottom: 0.75rem;
  letter-spacing: 0.01em;
}

.card-highlight__description {
  font-size: 0.875rem;
  color: var(--ml-text-secondary, #64748b);
  line-height: 1.55;
  margin: 0 0 1.25rem 0;
}

/* ── Badges ──────────────────────────────────────────────── */

.card-highlight__features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.card-highlight__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: var(--ml-background-alt, #f8fafc);
  color: var(--ml-text-secondary, #64748b);
  border: 1px solid var(--ml-border, #e2e8f0);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.card-highlight__badge--more {
  background: var(--ml-neutral-100, #f1f5f9);
  color: var(--ml-text-tertiary, #94a3b8);
}
</style>
