#!/usr/bin/env node
// Kubryx backend health check
// Usage: node scripts/health-check.js

const BACKENDS = [
  { name: 'creditblocks',  url: 'https://creditblock-rs-backend.onrender.com/health' },
  { name: 'eternalvault',  url: 'https://kubryx-eternalvault.onrender.com/health' },
  { name: 'lendora',       url: 'https://kubryx-lendora.onrender.com/health' },
  { name: 'trustmesh',     url: 'https://kubryx-trustmesh.onrender.com/health' },
  { name: 'shadow',        url: 'https://kubryx-shadow.onrender.com/health' },
  { name: 'cipher',        url: 'https://kubryx-cipher.onrender.com/api/health' },
  { name: 'syncsplit',     url: 'https://kubryx-syncsplit.onrender.com/health' },
  { name: 'palmflow',      url: 'https://kubryx-palmflow.onrender.com/api/health' },
];

const TIMEOUT_MS = 15000;
const PAD = 14;

async function probe({ name, url }) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    const body = text.length > 80 ? text.slice(0, 77) + '...' : text;
    if (res.ok) {
      return { name, status: 'ok', label: '✅', detail: body };
    }
    return { name, status: 'fail', label: '❌', detail: `HTTP ${res.status} — ${body}` };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { name, status: 'timeout', label: '⏳', detail: `timeout after ${TIMEOUT_MS / 1000}s` };
    }
    return { name, status: 'fail', label: '❌', detail: err.message };
  } finally {
    clearTimeout(t);
  }
}

(async () => {
  console.log('Kubryx backend health check\n');
  const results = await Promise.all(BACKENDS.map(probe));
  for (const r of results) {
    console.log(`${r.label} ${r.name.padEnd(PAD)} — ${r.detail}`);
  }
  const live = results.filter((r) => r.status === 'ok').length;
  console.log(`\n${live}/${BACKENDS.length} backends live`);
  process.exit(live === BACKENDS.length ? 0 : 1);
})();
