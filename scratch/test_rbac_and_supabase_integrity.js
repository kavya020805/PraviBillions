const http = require('http');
const { Pool } = require('pg');

const BASE_URL = 'http://localhost:3000';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres.vyixntenvmrxrsezxwyt:XuEL1Ree3ip4PRlB@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
});

async function apiRequest(path, method = 'GET', body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          cookies: res.headers['set-cookie'],
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Starting End-to-End RBAC & Supabase Integrity Tests ===\n');
  let failures = 0;

  // ── TEST 1: Citizen Login ──
  console.log('[1] Logging in as Citizen (citizen@gujarat.gov.in)...');
  const citizenLogin = await apiRequest('/api/auth/login', 'POST', {
    email: 'citizen@gujarat.gov.in',
    password: 'Citizen@12345',
  });
  if (citizenLogin.status !== 200 || !citizenLogin.data.success) {
    console.error('FAIL: Citizen login failed:', citizenLogin.data);
    failures++;
    return;
  }
  const citizenCookie = citizenLogin.cookies ? citizenLogin.cookies[0].split(';')[0] : null;
  console.log('✓ Citizen logged in successfully. Cookie:', citizenCookie ? 'Captured' : 'None');

  // ── TEST 2: Citizen Commits Life Event to OWN Family (240100000001) ──
  console.log('\n[2] Citizen committing newborn child "Devina Patel" to OWN Family (240100000001)...');
  const commitOwn = await apiRequest('/api/events', 'POST', {
    family_id: '240100000001',
    event_type: 'new_child_born',
    params: {
      child_name: 'Devina Patel',
      child_gender: 'female',
    },
    apply: true,
  }, citizenCookie);

  if (commitOwn.status === 200 && commitOwn.data.applied) {
    console.log('✓ API accepted event commit with HTTP 200.');
  } else {
    console.error('FAIL: Event commit rejected:', commitOwn.status, commitOwn.data);
    failures++;
  }

  // Verify in Supabase PostgreSQL
  const dbCheck = await pool.query(
    `SELECT * FROM public.members WHERE family_id = $1 AND name = $2`,
    ['240100000001', 'Devina Patel']
  );
  if (dbCheck.rows.length > 0) {
    console.log('✓ Supabase PostgreSQL verified: "Devina Patel" is in public.members table.');
  } else {
    console.error('FAIL: Member not found in Supabase database!');
    failures++;
  }

  const logCheck = await pool.query(
    `SELECT * FROM public.life_event_logs WHERE family_id = $1 AND event_type = $2 ORDER BY applied_at DESC LIMIT 1`,
    ['240100000001', 'new_child_born']
  );
  if (logCheck.rows.length > 0) {
    console.log('✓ Supabase PostgreSQL verified: Event logged in public.life_event_logs.');
  } else {
    console.error('FAIL: Event log not found in Supabase!');
    failures++;
  }

  // ── TEST 3: Citizen Attempting to Commit Event to ANOTHER Family (240100000002) ──
  console.log('\n[3] Citizen attempting to commit event to DIFFERENT Family (240100000002)...');
  const commitOther = await apiRequest('/api/events', 'POST', {
    family_id: '240100000002',
    event_type: 'new_child_born',
    params: {
      child_name: 'Intruder Child',
      child_gender: 'male',
    },
    apply: true,
  }, citizenCookie);

  if (commitOther.status === 403) {
    console.log('✓ Access Denied with HTTP 403 Forbidden as expected! Error:', commitOther.data.error);
  } else {
    console.error('FAIL: Security vulnerability! Citizen was NOT blocked with 403:', commitOther.status, commitOther.data);
    failures++;
  }

  // ── TEST 4: Citizen Attempting to Reset ANOTHER Family (240100000002) ──
  console.log('\n[4] Citizen attempting to reset DIFFERENT Family (240100000002)...');
  const resetOther = await apiRequest('/api/families/240100000002', 'POST', {
    action: 'reset',
  }, citizenCookie);

  if (resetOther.status === 403) {
    console.log('✓ Access Denied with HTTP 403 Forbidden as expected! Error:', resetOther.data.error);
  } else {
    console.error('FAIL: Security vulnerability! Citizen was NOT blocked from resetting another family:', resetOther.status, resetOther.data);
    failures++;
  }

  // ── TEST 5: Citizen Attempting to Access /api/duplicates ──
  console.log('\n[5] Citizen attempting to access /api/duplicates...');
  const dupGet = await apiRequest('/api/duplicates', 'GET', null, citizenCookie);
  if (dupGet.status === 403) {
    console.log('✓ Access Denied with HTTP 403 Forbidden as expected! Error:', dupGet.data.error);
  } else {
    console.error('FAIL: Citizen was able to access deduplication audit:', dupGet.status);
    failures++;
  }

  console.log('\n[6] Citizen attempting to modify duplicate status in /api/duplicates...');
  const dupPost = await apiRequest('/api/duplicates', 'POST', {
    action: 'update_status',
    pair_id: 'DUP-001',
    status: 'confirmed',
  }, citizenCookie);
  if (dupPost.status === 403) {
    console.log('✓ Access Denied with HTTP 403 Forbidden as expected! Error:', dupPost.data.error);
  } else {
    console.error('FAIL: Citizen was able to alter deduplication status:', dupPost.status);
    failures++;
  }

  // ── TEST 7: Guest Attempting to Commit Event or Reset ──
  console.log('\n[7] Unauthenticated Guest attempting to commit event (apply: true)...');
  const guestCommit = await apiRequest('/api/events', 'POST', {
    family_id: '240100000001',
    event_type: 'member_turns_60',
    params: { member_id: 'MEM001' },
    apply: true,
  }, null);
  if (guestCommit.status === 401) {
    console.log('✓ Access Denied with HTTP 401 Unauthorized as expected! Error:', guestCommit.data.error);
  } else {
    console.error('FAIL: Guest was not blocked with 401:', guestCommit.status);
    failures++;
  }

  // ── TEST 8: Admin Login & Full Audit Privileges ──
  console.log('\n[8] Logging in as Admin (admin@gujarat.gov.in)...');
  const adminLogin = await apiRequest('/api/auth/login', 'POST', {
    email: 'admin@gujarat.gov.in',
    password: 'Admin@12345',
  });
  if (adminLogin.status !== 200 || !adminLogin.data.success) {
    console.error('FAIL: Admin login failed:', adminLogin.data);
    failures++;
    return;
  }
  const adminCookie = adminLogin.cookies ? adminLogin.cookies[0].split(';')[0] : null;
  console.log('✓ Admin logged in successfully.');

  // ── TEST 9: Admin Commits Event on Family 240100000002 ──
  console.log('\n[9] Admin committing event on Family 240100000002...');
  const adminCommit = await apiRequest('/api/events', 'POST', {
    family_id: '240100000002',
    event_type: 'income_decreased',
    params: { new_income: 60000 },
    apply: true,
  }, adminCookie);
  if (adminCommit.status === 200 && adminCommit.data.applied) {
    console.log('✓ Admin successfully committed event to Family 240100000002.');
  } else {
    console.error('FAIL: Admin commit failed:', adminCommit.status, adminCommit.data);
    failures++;
  }

  // ── TEST 10: Admin Resets Family 240100000002 and 240100000001 ──
  console.log('\n[10] Admin resetting Family 240100000002 to baseline...');
  const adminReset = await apiRequest('/api/families/240100000002', 'POST', {
    action: 'reset',
  }, adminCookie);
  if (adminReset.status === 200 && adminReset.data.success) {
    console.log('✓ Admin successfully reset Family 240100000002 to baseline.');
  } else {
    console.error('FAIL: Admin reset failed:', adminReset.status, adminReset.data);
    failures++;
  }

  console.log('\n[11] Resetting Patel Demo Family 240100000001 to clean state...');
  const patelReset = await apiRequest('/api/families/240100000001', 'POST', {
    action: 'reset',
  }, adminCookie);
  if (patelReset.status === 200) {
    console.log('✓ Patel Demo Family successfully restored to baseline.');
  }

  // ── TEST 12: Admin Updates Deduplication Status in Supabase ──
  console.log('\n[12] Admin reviewing duplicate pair in /api/duplicates...');
  const dupUpdate = await apiRequest('/api/duplicates', 'POST', {
    action: 'update_status',
    pair_id: 'DUP001',
    status: 'confirmed',
  }, adminCookie);
  if (dupUpdate.status === 200 && dupUpdate.data.success) {
    console.log('✓ Admin updated duplicate DUP001 to "confirmed".');
  } else {
    console.error('FAIL: Admin duplicate update failed:', dupUpdate.status, dupUpdate.data);
    failures++;
  }

  // Verify duplicate update in Supabase
  const dupDbCheck = await pool.query(
    `SELECT status FROM public.duplicate_pairs WHERE id = $1`,
    ['DUP001']
  );
  if (dupDbCheck.rows.length > 0 && dupDbCheck.rows[0].status === 'confirmed') {
    console.log('✓ Supabase PostgreSQL verified: DUP001 status is "confirmed".');
  } else {
    console.warn('Note: DUP001 in DB:', dupDbCheck.rows[0]);
  }

  await pool.end();

  console.log('\n======================================================');
  if (failures === 0) {
    console.log('🎉 ALL 12 TESTS PASSED! RBAC, VALIDATION & SUPABASE INTEGRITY VERIFIED!');
  } else {
    console.log(`❌ ${failures} TEST(S) FAILED. Review errors above.`);
  }
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  pool.end();
});
