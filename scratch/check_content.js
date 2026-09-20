const fs = require('fs');
const text = fs.readFileSync('src/components/landing/landing-page.tsx', 'utf8');
const start = text.indexOf('const content = {');
const end = text.indexOf('export function LandingPage()');
const code = text.slice(start, end) + `
console.log('en keys:', Object.keys(content.en).length);
console.log('gu keys:', Object.keys(content.gu).length);
console.log('hi keys:', Object.keys(content.hi).length);
const missingGu = Object.keys(content.en).filter(k => !content.gu[k]);
const missingHi = Object.keys(content.en).filter(k => !content.hi[k]);
console.log('Missing in GU:', missingGu);
console.log('Missing in HI:', missingHi);
`;
eval(code);
