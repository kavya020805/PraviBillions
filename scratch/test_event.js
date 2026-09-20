async function test() {
  const res = await fetch('http://localhost:3000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      family_id: '240100000001',
      event_type: 'new_child_born',
      params: { child_gender: 'female', child_name: 'Ananya' }
    })
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Event response:', JSON.stringify(data, null, 2));
}
test();
