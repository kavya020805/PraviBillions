async function testDuplicates() {
  const res = await fetch('http://localhost:3000/api/duplicates');
  console.log('Duplicates Status:', res.status);
  const data = await res.json();
  console.log('Summary:', JSON.stringify(data.summary, null, 2));
  console.log('Flagged Pairs Count:', data.pairs?.length);
  if (data.pairs?.length > 0) {
    console.log('Sample Pair:', JSON.stringify(data.pairs[0], null, 2));
  }
}
testDuplicates();
