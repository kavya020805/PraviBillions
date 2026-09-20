async function testAuthAndSupabase() {
  console.log('--- 1. Test Admin Login ---');
  let res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gujarat.gov.in', password: 'Admin@12345' }),
  });
  console.log('Admin login status:', res.status);
  let data = await res.json();
  console.log('Admin user:', data.user?.full_name, 'Role:', data.user?.role);

  console.log('\n--- 2. Test Citizen Login ---');
  res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'citizen@gujarat.gov.in', password: 'Citizen@12345' }),
  });
  console.log('Citizen login status:', res.status);
  data = await res.json();
  console.log('Citizen user:', data.user?.full_name, 'Role:', data.user?.role, 'Family ID:', data.user?.family_id);

  console.log('\n--- 3. Test New Citizen Signup ---');
  const testEmail = `test_citizen_${Date.now()}@example.com`;
  res = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Citizen@12345',
      full_name: 'Dineshbhai Shah',
      role: 'citizen',
      district: 'Surat',
      area_type: 'urban',
      phone_number: '9876543299',
    }),
  });
  console.log('Signup status:', res.status);
  data = await res.json();
  console.log('New user created:', data.user?.full_name, 'Role:', data.user?.role, 'Assigned Family ID:', data.user?.family_id);

  console.log('\n--- 4. Verify New Family In Supabase via API ---');
  if (data.user?.family_id) {
    res = await fetch(`http://localhost:3000/api/families/${data.user.family_id}`);
    console.log('Fetched newly created family status:', res.status);
    const famData = await res.json();
    console.log('Family details from Supabase:', famData.family?.family_id, famData.family?.district, 'Members:', famData.family?.members?.map(m => m.name));
  }
}

testAuthAndSupabase().catch(console.error);
