import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // Load proxy configuration if exists (for multi-deck dev mode)
  let proxyConfig: Record<string, any> = {}
  const proxyConfigPath = path.resolve(__dirname, 'vite.proxy.config.js')

  if (fs.existsSync(proxyConfigPath)) {
    try {
      // Dynamically import the deck ports mapping
      const deckPortsModule = await import(`${proxyConfigPath}?t=${Date.now()}`)
      const deckPorts = deckPortsModule.default

      // Generate proxy configuration with rewrite functions
      Object.entries(deckPorts).forEach(([deck, port]) => {
        proxyConfig[`^/decks/${deck}`] = {
          target: `http://localhost:${port}`,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(`/decks/${deck}`, '')
        }
      })

      console.log('✅ Loaded proxy configuration for decks:', Object.keys(deckPorts).join(', '))
    } catch (error) {
      console.warn('⚠️  Failed to load proxy config:', error)
    }
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './index')
      }
    },
    root: './index',
    publicDir: './public',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    },
    server: {
      port: process.env.VITE_INDEX_PORT ? parseInt(process.env.VITE_INDEX_PORT) : 3000,
      proxy: proxyConfig
    }
  }
})
