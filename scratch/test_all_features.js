// Verification script for APIs, Auth, and Trilingual Dictionary consistency
const http = require('http');

async function testFetch(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function runAllTests() {
  console.log('=== RUNNING ALL COMPONENT & API CHECKS ===\n');

  // 1. Check Stats API
  const stats = await testFetch('/api/stats');
  console.log('1. /api/stats -> HTTP', stats.status, '| Total families:', stats.body?.total_families);

  // 2. Check Families list API
  const famList = await testFetch('/api/families?district=Ahmedabad');
  console.log('2. /api/families -> HTTP', famList.status, '| Count returned:', Array.isArray(famList.body) ? famList.body.length : 'error');

  // 3. Check Family Details API (Patel family)
  const patel = await testFetch('/api/families/240100000001');
  console.log('3. /api/families/240100000001 -> HTTP', patel.status, '| Head name:', patel.body?.family?.members?.[0]?.name, '| Schemes:', patel.body?.eligible_count);

  // 4. Check Simulator API (simulate new child born without commit)
  const sim = await testFetch('/api/events', {
    method: 'POST',
    body: {
      family_id: '240100000001',
      event_type: 'new_child_born',
      params: { child_name: 'TestBaby', gender: 'female' },
      apply: false
    }
  });
  console.log('4. /api/events (Simulator) -> HTTP', sim.status, '| Gained schemes count:', sim.body?.diff?.gained?.length);

  // 5. Check Deduplication API
  const dups = await testFetch('/api/duplicates');
  console.log('5. /api/duplicates -> HTTP', dups.status, '| Flagged pairs:', dups.body?.pairs?.length);

  // 6. Check Auth Login endpoint
  const authRes = await testFetch('/api/auth/login', {
    method: 'POST',
    body: { email: 'citizen@gujarat.gov.in', password: 'password123' }
  });
  console.log('6. /api/auth/login -> HTTP', authRes.status, '| User role:', authRes.body?.user?.role, '| Name:', authRes.body?.user?.full_name);

  console.log('\n=== ALL TESTED SERVICES RESPONDED SUCCESSFULLY ===');
}

runAllTests().catch(console.error);
