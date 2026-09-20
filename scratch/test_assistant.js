async function testAssistant() {
  const family = {
    family_id: 'TEST-001',
    district: 'Ahmedabad',
    household_income_annual: 80000,
    income_band: 'bpl',
    caste_category: 'sc',
    land_owned_acres: 0,
    house_type: 'kutcha',
    phone_number: '9876543210',
    address: 'Slum Quarters, Ahmedabad',
    pincode: '380001',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      {
        member_id: 'M1',
        family_id: 'TEST-001',
        name: 'Ramesh',
        relation_to_head: 'head',
        dob: '1984-01-01',
        gender: 'male',
        marital_status: 'married',
        occupation: 'daily wage',
        disability_status: false,
        education_level: 'primary',
        is_bpl: true,
        is_alive: true
      },
      {
        member_id: 'M2',
        family_id: 'TEST-001',
        name: 'Geeta',
        relation_to_head: 'spouse',
        dob: '1987-05-10',
        gender: 'female',
        marital_status: 'married',
        occupation: 'homemaker',
        disability_status: false,
        education_level: 'primary',
        is_bpl: true,
        is_alive: true
      },
      {
        member_id: 'M3',
        family_id: 'TEST-001',
        name: 'Pooja',
        relation_to_head: 'child',
        dob: '2025-06-01',
        gender: 'female',
        marital_status: 'single',
        occupation: 'none',
        disability_status: false,
        education_level: 'none',
        is_bpl: true,
        is_alive: true
      }
    ]
  };

  const res = await fetch('http://localhost:3000/api/eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ family })
  });
  console.log('Eligibility Status:', res.status);
  const data = await res.json();
  console.log('Eligible Schemes Count:', data.eligible_schemes?.length);
  data.eligible_schemes?.forEach(s => {
    console.log(` - [${s.category}] ${s.name}: ${s.benefit}`);
  });
}
testAssistant();
