#!/usr/bin/env node

import { spawn } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const BASE_PORT = 3001;
const INDEX_PORT = 3000;
const DECKS_DIR = resolve(projectRoot, 'decks');

// Get list of available decks
function getAvailableDecks() {
  const entries = readdirSync(DECKS_DIR, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory() && entry.name !== 'theme-demo')
    .map(entry => entry.name)
    .filter(name => existsSync(resolve(DECKS_DIR, name, 'slides.md')))
    .sort();
}

// Parse command line arguments
const args = process.argv.slice(2);
const requestedDecks = args.filter(arg => !arg.startsWith('--'));
const allDecks = getAvailableDecks();

let decksToStart = [];
if (requestedDecks.length > 0) {
  // Start only requested decks
  decksToStart = requestedDecks.filter(deck => {
    if (!allDecks.includes(deck)) {
      console.warn(`Warning: Deck '${deck}' not found, skipping...`);
      return false;
    }
    return true;
  });
} else {
  // Start all decks
  decksToStart = allDecks;
}

if (decksToStart.length === 0) {
  console.error('Error: No valid decks to start');
  console.error('Available decks:', allDecks.join(', '));
  console.error('\nUsage:');
  console.error('  npm run dev:all              # Start all decks');
  console.error('  npm run dev:all -- deck1 deck2  # Start specific decks');
  process.exit(1);
}

console.log('🚀 Starting multi-deck development environment\n');
console.log(`📚 Decks to start: ${decksToStart.join(', ')}\n`);

const processes = [];
const deckPorts = {};

// Start Slidev for each deck
decksToStart.forEach((deck, index) => {
  const port = BASE_PORT + index;
  const slidePath = resolve(DECKS_DIR, deck, 'slides.md');

  deckPorts[deck] = port;

  console.log(`Starting deck '${deck}' on port ${port}...`);

  const slidev = spawn('npx', ['slidev', slidePath, '--port', port.toString()], {
    cwd: projectRoot,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  // Prefix output with deck name
  slidev.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.includes('http://localhost')) {
        console.log(`[${deck}] ${line}`);
      }
    });
  });

  slidev.stderr.on('data', (data) => {
    console.error(`[${deck}] ${data}`);
  });

  slidev.on('error', (error) => {
    console.error(`[${deck}] Failed to start:`, error);
  });

  processes.push({ name: deck, process: slidev, port });
});

// Write proxy config file for Vite as JS module
const proxyConfigContent = `// Auto-generated proxy configuration for dev:all mode
// Do not edit manually - regenerated on each dev:all start

export default ${JSON.stringify(deckPorts, null, 2)}
`;

const configPath = resolve(projectRoot, 'vite.proxy.config.js');
const deckPortsJsonPath = resolve(projectRoot, 'index/public/deck-ports.json');

import('fs').then(fs => {
  fs.writeFileSync(configPath, proxyConfigContent);
  fs.writeFileSync(deckPortsJsonPath, JSON.stringify(deckPorts, null, 2));
  console.log(`\n✅ Proxy config written to vite.proxy.config.js`);
  console.log(`✅ Deck ports written to index/public/deck-ports.json`);
});

// Wait a bit for Slidev servers to start
setTimeout(() => {
  console.log('\n🌐 Starting index server on port', INDEX_PORT, '...\n');

  const vite = spawn('npm', ['run', 'dev:index'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, VITE_INDEX_PORT: INDEX_PORT.toString() }
  });

  vite.on('error', (error) => {
    console.error('Failed to start index server:', error);
  });

  processes.push({ name: 'index', process: vite, port: INDEX_PORT });

  // Print summary
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All servers started successfully!');
    console.log('='.repeat(60));
    console.log(`\n📍 Index: http://localhost:${INDEX_PORT}`);
    console.log(`   Browse all decks and click to open them\n`);
    console.log(`📚 Individual decks (direct access):`);
    decksToStart.forEach(deck => {
      console.log(`   • ${deck}: http://localhost:${deckPorts[deck]}`);
    });
    console.log('\n💡 Thumbnails are proxied through the index server');
    console.log('💡 Deck links open directly on their own ports');
    console.log('💡 Press Ctrl+C to stop all servers\n');
  }, 2000);
}, 3000);

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down all servers...');
  processes.forEach(({ name, process }) => {
    console.log(`  Stopping ${name}...`);
    process.kill();
  });
  process.exit(0);
});

process.on('SIGTERM', () => {
  processes.forEach(({ process }) => process.kill());
  process.exit(0);
});
