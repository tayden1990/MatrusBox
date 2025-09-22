// Simple smoke test for Next.js web study API proxies
const WEB_BASE = 'http://localhost:3000';

async function run() {
  console.log('🧪 Testing Web Study Proxies (Next.js)\n');
  const fetch = globalThis.fetch || (await import('node-fetch')).default;

  // Helper to pretty log
  const log = (msg, ...args) => console.log(`   ${msg}`, ...args);

  try {
    // 1) Start session
    console.log('1. Starting study session via web proxy...');
    const startRes = await fetch(`${WEB_BASE}/api/study/start`, { method: 'POST' });
    const startData = await startRes.json().catch(() => ({}));
    log(`Status: ${startRes.status}`);
    if (!startRes.ok || !startData?.data?.id) {
      log('❌ Failed to start session', startData);
      return;
    }
    const sid = startData.data.id;
    log(`✅ Session started, id: ${sid}`);

    // 2) Fetch next card (up to a few iterations)
    console.log('\n2. Fetching next cards and answering...');
    let iterations = 0;
    while (iterations < 3) {
      const nextRes = await fetch(`${WEB_BASE}/api/study/next?sessionId=${encodeURIComponent(sid)}`);
      const nextData = await nextRes.json().catch(() => ({}));
      log(`- next() status: ${nextRes.status}`);
      if (!nextRes.ok) {
        log('❌ next() failed', nextData);
        break;
      }
      if (!nextData?.data) {
        log('ℹ️  No more cards, ending session...');
        break;
      }
      const card = nextData.data;
      log(`   Got card: ${card.id} | ${card.front?.slice?.(0, 40) || ''}...`);

      // Submit an answer (random correct/incorrect/skip)
      const results = ['correct', 'incorrect', 'skip'];
      const result = results[Math.floor(Math.random() * results.length)];
      const ansRes = await fetch(`${WEB_BASE}/api/study/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid, cardId: card.id, result })
      });
      const ansData = await ansRes.json().catch(() => ({}));
      log(`   answer(${result}) status: ${ansRes.status}`);
      if (!ansRes.ok) {
        log('❌ answer() failed', ansData);
        break;
      }

      iterations++;
    }

    // 3) End session (mocked stats in demo mode)
    console.log('\n3. Ending session...');
    const endRes = await fetch(`${WEB_BASE}/api/study/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid })
    });
    const endData = await endRes.json().catch(() => ({}));
    log(`Status: ${endRes.status}`);
    if (endRes.ok) {
      log('✅ Ended session, stats:', endData?.data?.stats || endData);
    } else {
      log('❌ Failed to end session', endData);
    }

    console.log('\n🎯 Web proxy test completed');
  } catch (err) {
    console.error('❌ Test failed:', err?.message || err);
  }
}

run();
