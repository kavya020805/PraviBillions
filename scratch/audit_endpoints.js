async function auditAllEndpoints() {
  const base = 'http://localhost:3000';
  console.log('--- AUDITING ALL API ENDPOINTS ---');

  // 1. Stats
  const resStats = await fetch(`${base}/api/stats`);
  console.log('1. /api/stats:', resStats.status, (await resStats.json()).total_families === 50 ? 'PASS' : 'FAIL');

  // 2. Families
  const resFamilies = await fetch(`${base}/api/families?limit=5`);
  const fams = await resFamilies.json();
  console.log('2. /api/families:', resFamilies.status, fams.length > 0 ? 'PASS' : 'FAIL');

  // 3. Family Detail
  const resDetail = await fetch(`${base}/api/families/240100000001`);
  const detail = await resDetail.json();
  console.log('3. /api/families/[id]:', resDetail.status, detail.family?.family_id === '240100000001' ? 'PASS' : 'FAIL');

  // 4. Events Simulation
  const resEvents = await fetch(`${base}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      family_id: '240100000001',
      event_type: 'new_child_born',
      params: { child_gender: 'female', child_name: 'Ananya' }
    })
  });
  const eventData = await resEvents.json();
  console.log('4. /api/events:', resEvents.status, eventData.diff?.gained?.length > 0 ? 'PASS' : 'FAIL');

  // 5. Duplicates
  const resDuplicates = await fetch(`${base}/api/duplicates?threshold=50`);
  const dups = await resDuplicates.json();
  console.log('5. /api/duplicates:', resDuplicates.status, dups.pairs?.length > 0 ? 'PASS' : 'FAIL');

  // 6. Eligibility (Assistant engine)
  const resElig = await fetch(`${base}/api/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ family: detail.family })
  });
  const elig = await resElig.json();
  console.log('6. /api/eligibility:', resElig.status, elig.eligible_schemes?.length > 0 ? 'PASS' : 'FAIL');

  console.log('--- ALL ENDPOINTS AUDITED SUCCESSFULLY ---');
}
auditAllEndpoints();
