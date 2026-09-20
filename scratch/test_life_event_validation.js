async function testValidation() {
  const familyId = '240100000001';

  console.log('--- Step 1: Reset family to baseline ---');
  let res = await fetch(`http://localhost:3000/api/families/${familyId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset' }),
  });
  console.log('Reset response:', res.status);

  console.log('\n--- Step 2: Add child Ananya ---');
  res = await fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      family_id: familyId,
      event_type: 'new_child_born',
      params: { child_gender: 'female', child_name: 'Ananya' },
      apply: true,
    }),
  });
  const data1 = await res.json();
  console.log('First addition status:', res.status, 'gained:', data1.diff?.gained?.map(g => g.scheme_name));

  console.log('\n--- Step 3: Try adding duplicate child Ananya again ---');
  res = await fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      family_id: familyId,
      event_type: 'new_child_born',
      params: { child_gender: 'female', child_name: 'Ananya' },
      apply: true,
    }),
  });
  const data2 = await res.json();
  console.log('Second addition status:', res.status, 'Error received:', data2.error);

  console.log('\n--- Step 3b: Try adding child named "Priya" when Priya Patel is already a daughter ---');
  res = await fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      family_id: familyId,
      event_type: 'new_child_born',
      params: { child_gender: 'female', child_name: 'Priya' },
      apply: true,
    }),
  });
  const data2b = await res.json();
  console.log('Priya addition status:', res.status, 'Error received:', data2b.error);

  console.log('\n--- Step 4: Try invalid transition (turns 18 on head of family) ---');
  res = await fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      family_id: familyId,
      event_type: 'member_turns_18',
      params: { member_id: 'MEM001' },
      apply: true,
    }),
  });
  const data3 = await res.json();
  console.log('Invalid age transition status:', res.status, 'Error received:', data3.error);

  console.log('\n--- Step 5: Clean up by resetting family ---');
  res = await fetch(`http://localhost:3000/api/families/${familyId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset' }),
  });
  console.log('Cleanup reset status:', res.status);
}

testValidation().catch(console.error);
