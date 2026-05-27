#!/usr/bin/env node
// Built by vsrupeshkumar

const checks = [
  {
    name: 'Kubryx Hub',
    url: 'https://kubryx.vercel.app/api/health',
    expect: { status: 'ok', tools: 8 },
  },
  {
    name: 'CreditBlocks',
    url: 'https://creditblock-rs-backend.onrender.com/health',
    expect: { status: 'healthy' },
  },
  {
    name: 'EternalVault',
    url: 'https://kubryx-eternalvault.onrender.com/health',
    expect: { status: 'ok' },
  },
  {
    name: 'Lendora AI',
    url: 'https://kubryx-lendora.onrender.com/health',
    expect: { status: 'ok' },
  },
  {
    name: 'TrustMesh',
    url: 'https://kubryx-trustmesh.onrender.com/health',
    expect: { status: 'ok' },
  },
  {
    name: 'Stealth Executive Suite',
    url: 'https://kubryx-shadow.onrender.com/health',
    expect: { status: 'ok' },
  },
  {
    name: 'CipherVault',
    url: 'https://kubryx-cipher.onrender.com/api/health',
    expect: { status: 'ok' },
  },
  {
    name: 'StellarSyncSplit',
    url: 'https://kubryx-syncsplit.onrender.com/health',
    expect: { status: 'ok' },
  },
  {
    name: 'Yield Operations Hub',
    url: 'https://kubryx-palmflow.onrender.com/api/health',
    expect: { status: 'ok' },
  },
  {
    name: 'QIE Mainnet RPC',
    url: 'https://rpc.qie.space',
    method: 'POST',
    body: { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] },
    expectField: 'result',
  },
  {
    name: 'Solana Devnet RPC',
    url: 'https://api.devnet.solana.com',
    method: 'POST',
    body: { jsonrpc: '2.0', id: 1, method: 'getHealth', params: [] },
    expectField: 'result',
  },
  {
    name: 'Stellar Horizon',
    url: 'https://horizon-testnet.stellar.org',
    expect: {},
  },
]

async function runCheck(check) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const opts = {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    }
    if (check.method === 'POST') {
      opts.method = 'POST'
      opts.body = JSON.stringify(check.body)
    }
    const res = await fetch(check.url, opts)
    clearTimeout(timeout)
    if (!res.ok) {
      return { name: check.name, status: 'FAIL', detail: `HTTP ${res.status}` }
    }
    const data = await res.json().catch(() => ({}))
    if (check.expectField && !data[check.expectField]) {
      return { name: check.name, status: 'FAIL', detail: `Missing field: ${check.expectField}` }
    }
    if (check.expect) {
      for (const [k, v] of Object.entries(check.expect)) {
        if (data[k] !== v) {
          return { name: check.name, status: 'WARN', detail: `${k}: expected ${v}, got ${data[k]}` }
        }
      }
    }
    return { name: check.name, status: 'OK', detail: 'Live' }
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      return { name: check.name, status: 'TIMEOUT', detail: 'No response in 8s' }
    }
    return { name: check.name, status: 'FAIL', detail: err.message }
  }
}

async function main() {
  console.log('\n🚀 Kubryx Demo Check\n' + '═'.repeat(50))
  const results = await Promise.all(checks.map(runCheck))
  let ok = 0, warn = 0, fail = 0
  for (const r of results) {
    const icon =
      r.status === 'OK' ? '✅' :
      r.status === 'WARN' ? '⚠️' :
      r.status === 'TIMEOUT' ? '⏳' : '❌'
    console.log(`${icon} ${r.name.padEnd(22)} ${r.detail}`)
    if (r.status === 'OK') ok++
    else if (r.status === 'WARN') warn++
    else fail++
  }
  console.log('\n' + '═'.repeat(50))
  console.log(`✅ ${ok} live  ⚠️ ${warn} warning  ❌ ${fail} offline`)
  if (fail === 0) {
    console.log('\n🎯 All systems go. Ready for demo.\n')
  } else {
    console.log(`\n⚠️  ${fail} service(s) offline. Demo mode will activate for those tools.\n`)
  }
}

main()
