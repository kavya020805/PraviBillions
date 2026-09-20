// ============================================================
// Family ID Copilot — Declarative Scheme Rules
// 20 real schemes with publicly documented eligibility criteria
// ============================================================

import type { SchemeRule, Family, FamilyMember } from './types';

// ---------- Helper functions ----------

function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getHead(family: Family): FamilyMember | undefined {
  return family.members.find(m => m.relation_to_head === 'head' && m.is_alive);
}

function hasAdultSon(family: Family): boolean {
  return family.members.some(
    m => m.relation_to_head === 'child' && m.gender === 'male' && getAge(m.dob) >= 21 && m.is_alive
  );
}

function countGirlChildren(family: Family): number {
  return family.members.filter(
    m => m.relation_to_head === 'child' && m.gender === 'female' && m.is_alive
  ).length;
}

function getAliveMembers(family: Family): FamilyMember[] {
  return family.members.filter(m => m.is_alive);
}

// ---------- Scheme Definitions ----------

export const schemeRules: SchemeRule[] = [
  // ── 1. National Family Benefit Scheme (Gujarat) ──
  {
    id: 'nfbs_gujarat',
    name: 'National Family Benefit Scheme',
    name_hi: 'राष्ट्रीय पारिवारिक लाभ योजना',
    name_gu: 'રાષ્ટ્રીય કુટુંબ લાભ યોજના',
    description: 'One-time ₹20,000 financial assistance to BPL families on the death of the primary breadwinner aged 18-59.',
    description_hi: '18-59 वर्ष के मुख्य कमाने वाले की मृत्यु पर बीपीएल परिवारों को ₹20,000 की एकमुश्त सहायता।',
    description_gu: '18-59 વર્ષના મુખ્ય કમાનાર વ્યક્તિના મૃત્યુ પર BPL કુટુંબને ₹20,000ની એકવખતની સહાય.',
    benefit: '₹20,000 lump sum',
    benefit_hi: '₹20,000 एकमुश्त',
    benefit_gu: '₹20,000 એકવખત',
    category: 'social',
    triggering_fields: ['is_alive', 'is_bpl', 'dob'],
    scope: 'family',
    next_steps: 'Apply at your nearest District Social Welfare Office or e-Gram center with death certificate and Aadhaar card.',
    next_steps_hi: 'अपने निकटतम जिला समाज कल्याण कार्यालय या ई-ग्राम केंद्र में मृत्यु प्रमाण पत्र और आधार कार्ड के साथ आवेदन करें।',
    next_steps_gu: 'મૃત્યુ પ્રમાણપત્ર અને આધાર કાર્ડ સાથે નજીકના જિલ્લા સમાજ કલ્યાણ કાર્યાલય અથવા ઈ-ગ્રામ કેન્દ્ર ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family) => {
      const head = getHead(family);
      // Eligible if head has died (is_alive = false), was BPL, aged 18-59
      const deceasedBreadwinner = family.members.find(
        m => m.relation_to_head === 'head' && !m.is_alive
      );
      if (!deceasedBreadwinner) return false;
      const age = getAge(deceasedBreadwinner.dob);
      return age >= 18 && age <= 59 && (family.income_band === 'bpl' || family.income_band === 'aay');
    },
  },

  // ── 2. Vridh Sahay (Old-Age Pension) ──
  {
    id: 'vridh_sahay',
    name: 'Vridh Sahay (Old-Age Pension)',
    name_hi: 'वृद्ध सहाय (वृद्धावस्था पेंशन)',
    name_gu: 'વૃદ્ધ સહાય (વૃદ્ધાવસ્થા પેન્શન)',
    description: 'Monthly pension of ₹1,000-1,250 for senior citizens aged 60+ from BPL families.',
    description_hi: 'बीपीएल परिवारों के 60+ वर्ष के वरिष्ठ नागरिकों को ₹1,000-1,250 मासिक पेंशन।',
    description_gu: 'BPL કુટુંબના 60+ વર્ષના વરિષ્ઠ નાગરિકોને ₹1,000-1,250 માસિક પેન્શન.',
    benefit: '₹1,000/month (60-79 yrs), ₹1,250/month (80+ yrs)',
    benefit_hi: '₹1,000/माह (60-79 वर्ष), ₹1,250/माह (80+ वर्ष)',
    benefit_gu: '₹1,000/મહિનો (60-79 વર્ષ), ₹1,250/મહિનો (80+ વર્ષ)',
    category: 'pension',
    triggering_fields: ['dob', 'is_bpl', 'household_income_annual'],
    scope: 'member',
    next_steps: 'Apply online at Digital Gujarat portal or visit your nearest Mamlatdar office with Aadhaar, age proof, and income certificate.',
    next_steps_hi: 'डिजिटल गुजरात पोर्टल पर ऑनलाइन आवेदन करें या आधार, आयु प्रमाण और आय प्रमाण पत्र के साथ निकटतम मामलतदार कार्यालय जाएं।',
    next_steps_gu: 'ડિજિટલ ગુજરાત પોર્ટલ પર ઓનલાઈન અરજી કરો અથવા આધાર, ઉંમરનો પુરાવો અને આવકનું પ્રમાણપત્ર સાથે નજીકની મામલતદાર કચેરી ખાતે જાઓ.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      const incomeLimit = family.area_type === 'rural' ? 120000 : 150000;
      return age >= 60 && family.household_income_annual <= incomeLimit;
    },
  },

  // ── 3. Ganga Swaroopa (Widow Pension) ──
  {
    id: 'ganga_swaroopa',
    name: 'Ganga Swaroopa (Widow Pension)',
    name_hi: 'गंगा स्वरूप (विधवा पेंशन)',
    name_gu: 'ગંગા સ્વરૂપા (વિધવા પેન્શન)',
    description: 'Monthly pension of ₹1,250 for widows aged 18-60 without an adult son.',
    description_hi: 'वयस्क पुत्र के बिना 18-60 वर्ष की विधवाओं को ₹1,250 मासिक पेंशन।',
    description_gu: 'પુખ્ત પુત્ર વગરની 18-60 વર્ષની વિધવાઓને ₹1,250 માસિક પેન્શન.',
    benefit: '₹1,250/month',
    benefit_hi: '₹1,250/माह',
    benefit_gu: '₹1,250/મહિનો',
    category: 'pension',
    triggering_fields: ['marital_status', 'dob'],
    scope: 'member',
    next_steps: 'Apply at your nearest District Social Welfare Office or e-Gram center with Aadhaar, husband\'s death certificate, and income proof.',
    next_steps_hi: 'आधार, पति का मृत्यु प्रमाण पत्र और आय प्रमाण के साथ निकटतम जिला समाज कल्याण कार्यालय या ई-ग्राम केंद्र में आवेदन करें।',
    next_steps_gu: 'આધાર, પતિનું મૃત્યુ પ્રમાણપત્ર અને આવકના પુરાવા સાથે નજીકના જિલ્લા સમાજ કલ્યાણ કાર્યાલય અથવા ઈ-ગ્રામ કેન્દ્ર ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      const incomeLimit = family.area_type === 'rural' ? 120000 : 150000;
      return (
        member.gender === 'female' &&
        member.marital_status === 'widowed' &&
        age >= 18 && age <= 60 &&
        !hasAdultSon(family) &&
        family.household_income_annual <= incomeLimit
      );
    },
  },

  // ── 4. Disability Pension (Gujarat) ──
  {
    id: 'disability_pension',
    name: 'Disability Pension',
    name_hi: 'विकलांग पेंशन',
    name_gu: 'દિવ્યાંગ પેન્શન',
    description: 'Monthly pension of ₹1,000-1,250 for persons with 60%+ disability from BPL families.',
    description_hi: 'बीपीएल परिवारों के 60%+ विकलांगता वाले व्यक्तियों को ₹1,000-1,250 मासिक पेंशन।',
    description_gu: 'BPL કુટુંબના 60%+ દિવ્યાંગતા ધરાવતા વ્યક્તિઓને ₹1,000-1,250 માસિક પેન્શન.',
    benefit: '₹1,000-1,250/month',
    benefit_hi: '₹1,000-1,250/माह',
    benefit_gu: '₹1,000-1,250/મહિનો',
    category: 'pension',
    triggering_fields: ['disability_status', 'is_bpl'],
    scope: 'member',
    next_steps: 'Apply at District Social Welfare Office with disability certificate (60%+), Aadhaar, and income certificate.',
    next_steps_hi: 'विकलांगता प्रमाण पत्र (60%+), आधार और आय प्रमाण पत्र के साथ जिला समाज कल्याण कार्यालय में आवेदन करें।',
    next_steps_gu: 'દિવ્યાંગતા પ્રમાણપત્ર (60%+), આધાર અને આવકનું પ્રમાણપત્ર સાથે જિલ્લા સમાજ કલ્યાણ કાર્યાલય ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      return (
        member.disability_status &&
        (family.income_band === 'bpl' || family.income_band === 'aay')
      );
    },
  },

  // ── 5. Post-Matric Scholarship (SC) ──
  {
    id: 'post_matric_sc',
    name: 'Post-Matric Scholarship (SC)',
    name_hi: 'मैट्रिक-उत्तर छात्रवृत्ति (अनुसूचित जाति)',
    name_gu: 'મેટ્રિક પછીની શિષ્યવૃત્તિ (SC)',
    description: 'Scholarship covering tuition and maintenance for SC students in higher education.',
    description_hi: 'उच्च शिक्षा में अनुसूचित जाति के छात्रों के लिए ट्यूशन और रखरखाव की छात्रवृत्ति।',
    description_gu: 'ઉચ્ચ શિક્ષણમાં SC વિદ્યાર્થીઓ માટે ટ્યુશન અને ભરણપોષણ શિષ્યવૃત્તિ.',
    benefit: 'Full tuition + maintenance allowance',
    benefit_hi: 'पूर्ण ट्यूशन + रखरखाव भत्ता',
    benefit_gu: 'સંપૂર્ણ ટ્યુશન + ભરણપોષણ ભથ્થું',
    category: 'scholarship',
    triggering_fields: ['dob', 'caste_category', 'education_level', 'household_income_annual'],
    scope: 'member',
    next_steps: 'Apply online at Digital Gujarat portal or e-Samaj Kalyan portal with caste certificate, income certificate, and previous marksheet.',
    next_steps_hi: 'जाति प्रमाण पत्र, आय प्रमाण पत्र और पिछली मार्कशीट के साथ डिजिटल गुजरात या ई-समाज कल्याण पोर्टल पर ऑनलाइन आवेदन करें।',
    next_steps_gu: 'જાતિ પ્રમાણપત્ર, આવકનું પ્રમાણપત્ર અને અગાઉની માર્કશીટ સાથે ડિજિટલ ગુજરાત અથવા ઈ-સમાજ કલ્યાણ પોર્ટલ પર ઓનલાઈન અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        family.caste_category === 'sc' &&
        age >= 17 && age <= 30 &&
        (member.education_level === 'higher_secondary' || member.education_level === 'graduate') &&
        family.household_income_annual <= 250000
      );
    },
  },

  // ── 6. Post-Matric Scholarship (ST) ──
  {
    id: 'post_matric_st',
    name: 'Post-Matric Scholarship (ST)',
    name_hi: 'मैट्रिक-उत्तर छात्रवृत्ति (अनुसूचित जनजाति)',
    name_gu: 'મેટ્રિક પછીની શિષ્યવૃત્તિ (ST)',
    description: 'Scholarship covering tuition and maintenance for ST students in higher education.',
    description_hi: 'उच्च शिक्षा में अनुसूचित जनजाति के छात्रों के लिए ट्यूशन और रखरखाव की छात्रवृत्ति।',
    description_gu: 'ઉચ્ચ શિક્ષણમાં ST વિદ્યાર્થીઓ માટે ટ્યુશન અને ભરણપોષણ શિષ્યવૃત્તિ.',
    benefit: 'Full tuition + maintenance allowance',
    benefit_hi: 'पूर्ण ट्यूशन + रखरखाव भत्ता',
    benefit_gu: 'સંપૂર્ણ ટ્યુશન + ભરણપોષણ ભથ્થું',
    category: 'scholarship',
    triggering_fields: ['dob', 'caste_category', 'education_level', 'household_income_annual'],
    scope: 'member',
    next_steps: 'Apply online at Digital Gujarat portal or e-Samaj Kalyan portal with caste certificate, income certificate, and previous marksheet.',
    next_steps_hi: 'जाति प्रमाण पत्र, आय प्रमाण पत्र और पिछली मार्कशीट के साथ डिजिटल गुजरात या ई-समाज कल्याण पोर्टल पर ऑनलाइन आवेदन करें।',
    next_steps_gu: 'જાતિ પ્રમાણપત્ર, આવકનું પ્રમાણપત્ર અને અગાઉની માર્કશીટ સાથે ડિજિટલ ગુજરાત અથવા ઈ-સમાજ કલ્યાણ પોર્ટલ પર ઓનલાઈન અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        family.caste_category === 'st' &&
        age >= 17 && age <= 30 &&
        (member.education_level === 'higher_secondary' || member.education_level === 'graduate') &&
        family.household_income_annual <= 250000
      );
    },
  },

  // ── 7. Post-Matric Scholarship (OBC) ──
  {
    id: 'post_matric_obc',
    name: 'Post-Matric Scholarship (OBC)',
    name_hi: 'मैट्रिक-उत्तर छात्रवृत्ति (अन्य पिछड़ा वर्ग)',
    name_gu: 'મેટ્રિક પછીની શિષ્યવૃત્તિ (OBC)',
    description: 'Scholarship for OBC students pursuing higher education with family income below ₹1 lakh.',
    description_hi: '₹1 लाख से कम पारिवारिक आय वाले ओबीसी छात्रों के लिए उच्च शिक्षा छात्रवृत्ति।',
    description_gu: '₹1 લાખથી ઓછી કુટુંબ આવક ધરાવતા OBC વિદ્યાર્થીઓ માટે ઉચ્ચ શિક્ષણ શિષ્યવૃત્તિ.',
    benefit: 'Tuition fees + maintenance allowance',
    benefit_hi: 'ट्यूशन फीस + रखरखाव भत्ता',
    benefit_gu: 'ટ્યુશન ફી + ભરણપોષણ ભથ્થું',
    category: 'scholarship',
    triggering_fields: ['dob', 'caste_category', 'education_level', 'household_income_annual'],
    scope: 'member',
    next_steps: 'Apply online at e-Samaj Kalyan portal with OBC certificate, income certificate (below ₹1L), and academic records.',
    next_steps_hi: 'ओबीसी प्रमाण पत्र, आय प्रमाण पत्र (₹1L से कम) और शैक्षिक रिकॉर्ड के साथ ई-समाज कल्याण पोर्टल पर ऑनलाइन आवेदन करें।',
    next_steps_gu: 'OBC પ્રમાણપત્ર, આવકનું પ્રમાણપત્ર (₹1L થી ઓછું) અને શૈક્ષણિક રેકોર્ડ સાથે ઈ-સમાજ કલ્યાણ પોર્ટલ પર ઓનલાઈન અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        family.caste_category === 'obc' &&
        age >= 17 && age <= 30 &&
        (member.education_level === 'higher_secondary' || member.education_level === 'graduate') &&
        family.household_income_annual <= 100000
      );
    },
  },

  // ── 8. Vahli Dikri Yojana (Girl Child Scheme) ──
  {
    id: 'vahli_dikri',
    name: 'Vahli Dikri Yojana',
    name_hi: 'वहाली दीकरी योजना',
    name_gu: 'વહાલી દીકરી યોજના',
    description: 'Financial assistance up to ₹1,10,000 for families with up to 2 girl children, for education and marriage.',
    description_hi: '2 बेटियों तक वाले परिवारों को शिक्षा और विवाह के लिए ₹1,10,000 तक की वित्तीय सहायता।',
    description_gu: '2 દીકરીઓ સુધીના કુટુંબો માટે શિક્ષણ અને લગ્ન માટે ₹1,10,000 સુધીની નાણાકીય સહાય.',
    benefit: '₹4,000 (Class 1) + ₹6,000 (Class 9) + ₹1,00,000 (age 18/marriage)',
    benefit_hi: '₹4,000 (कक्षा 1) + ₹6,000 (कक्षा 9) + ₹1,00,000 (18 वर्ष/विवाह)',
    benefit_gu: '₹4,000 (ધોરણ 1) + ₹6,000 (ધોરણ 9) + ₹1,00,000 (18 વર્ષ/લગ્ન)',
    category: 'social',
    triggering_fields: ['gender', 'dob', 'household_income_annual'],
    scope: 'member',
    next_steps: 'Apply at your nearest Anganwadi center or District Women & Child Development office with birth certificate and income proof.',
    next_steps_hi: 'जन्म प्रमाण पत्र और आय प्रमाण के साथ निकटतम आंगनवाड़ी केंद्र या जिला महिला एवं बाल विकास कार्यालय में आवेदन करें।',
    next_steps_gu: 'જન્મ પ્રમાણપત્ર અને આવકના પુરાવા સાથે નજીકના આંગણવાડી કેન્દ્ર અથવા જિલ્લા મહિલા અને બાળ વિકાસ કાર્યાલય ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      return (
        member.gender === 'female' &&
        member.relation_to_head === 'child' &&
        countGirlChildren(family) <= 2 &&
        family.household_income_annual <= 200000
      );
    },
  },

  // ── 9. PMAY Housing (EWS) ──
  {
    id: 'pmay_ews',
    name: 'Pradhan Mantri Awas Yojana (EWS)',
    name_hi: 'प्रधानमंत्री आवास योजना (ईडब्ल्यूएस)',
    name_gu: 'પ્રધાનમંત્રી આવાસ યોજના (EWS)',
    description: 'Housing subsidy for economically weaker sections to build or buy a pucca house.',
    description_hi: 'पक्का घर बनाने या खरीदने के लिए आर्थिक रूप से कमजोर वर्गों को आवास सब्सिडी।',
    description_gu: 'પાકું ઘર બનાવવા અથવા ખરીદવા માટે આર્થિક રીતે નબળા વર્ગો માટે આવાસ સબસિડી.',
    benefit: 'Up to ₹2.67 lakh subsidy on home loan interest',
    benefit_hi: 'होम लोन ब्याज पर ₹2.67 लाख तक सब्सिडी',
    benefit_gu: 'હોમ લોન વ્યાજ પર ₹2.67 લાખ સુધી સબસિડી',
    category: 'housing',
    triggering_fields: ['house_type', 'household_income_annual'],
    scope: 'family',
    next_steps: 'Apply online at PMAY portal (pmaymis.gov.in) or visit your local Municipal Corporation / Nagar Palika office.',
    next_steps_hi: 'PMAY पोर्टल (pmaymis.gov.in) पर ऑनलाइन आवेदन करें या अपने स्थानीय नगर निगम / नगर पालिका कार्यालय जाएं।',
    next_steps_gu: 'PMAY પોર્ટલ (pmaymis.gov.in) પર ઓનલાઈન અરજી કરો અથવા તમારી સ્થાનિક મ્યુનિસિપલ કોર્પોરેશન / નગર પાલિકા કાર્યાલય ખાતે જાઓ.',
    eligibility_predicate: (family: Family) => {
      return family.house_type === 'kutcha' && family.household_income_annual <= 300000;
    },
  },

  // ── 10. PMAY Housing (LIG) ──
  {
    id: 'pmay_lig',
    name: 'Pradhan Mantri Awas Yojana (LIG)',
    name_hi: 'प्रधानमंत्री आवास योजना (एलआईजी)',
    name_gu: 'પ્રધાનમંત્રી આવાસ યોજના (LIG)',
    description: 'Housing subsidy for low-income groups to build or buy a pucca house.',
    description_hi: 'पक्का घर बनाने या खरीदने के लिए कम आय वर्ग को आवास सब्सिडी।',
    description_gu: 'પાકું ઘર બનાવવા અથવા ખરીદવા માટે ઓછી આવક જૂથ માટે આવાસ સબસિડી.',
    benefit: 'Up to ₹2.35 lakh subsidy on home loan interest',
    benefit_hi: 'होम लोन ब्याज पर ₹2.35 लाख तक सब्सिडी',
    benefit_gu: 'હોમ લોન વ્યાજ પર ₹2.35 લાખ સુધી સબસિડી',
    category: 'housing',
    triggering_fields: ['house_type', 'household_income_annual'],
    scope: 'family',
    next_steps: 'Apply online at PMAY portal (pmaymis.gov.in) or visit your nearest Common Service Centre.',
    next_steps_hi: 'PMAY पोर्टल (pmaymis.gov.in) पर ऑनलाइन आवेदन करें या निकटतम सामान्य सेवा केंद्र जाएं।',
    next_steps_gu: 'PMAY પોર્ટલ (pmaymis.gov.in) પર ઓનલાઈન અરજી કરો અથવા નજીકના કોમન સર્વિસ સેન્ટર ખાતે જાઓ.',
    eligibility_predicate: (family: Family) => {
      return (
        family.house_type === 'kutcha' &&
        family.household_income_annual > 300000 &&
        family.household_income_annual <= 600000
      );
    },
  },

  // ── 11. Janani Suraksha Yojana (Maternity Benefit) ──
  {
    id: 'janani_suraksha',
    name: 'Janani Suraksha Yojana',
    name_hi: 'जननी सुरक्षा योजना',
    name_gu: 'જનની સુરક્ષા યોજના',
    description: 'Cash assistance for pregnant women from BPL/SC/ST families for institutional delivery.',
    description_hi: 'बीपीएल/अनुसूचित जाति/अनुसूचित जनजाति परिवारों की गर्भवती महिलाओं को संस्थागत प्रसव के लिए नकद सहायता।',
    description_gu: 'BPL/SC/ST કુટુંબની સગર્ભા મહિલાઓને સંસ્થાગત પ્રસૂતિ માટે રોકડ સહાય.',
    benefit: '₹700 (rural) / ₹600 (urban) per delivery',
    benefit_hi: '₹700 (ग्रामीण) / ₹600 (शहरी) प्रति प्रसव',
    benefit_gu: '₹700 (ગ્રામીણ) / ₹600 (શહેરી) દરેક પ્રસૂતિ દીઠ',
    category: 'health',
    triggering_fields: ['is_pregnant', 'is_bpl', 'caste_category'],
    scope: 'member',
    next_steps: 'Register at your nearest government hospital or PHC during pregnancy. Carry Aadhaar, BPL card, and MCH card.',
    next_steps_hi: 'गर्भावस्था के दौरान निकटतम सरकारी अस्पताल या पीएचसी में पंजीकरण करें। आधार, बीपीएल कार्ड और एमसीएच कार्ड लेकर जाएं।',
    next_steps_gu: 'ગર્ભાવસ્થા દરમિયાન નજીકની સરકારી હોસ્પિટલ અથવા PHC ખાતે નોંધણી કરાવો. આધાર, BPL કાર્ડ અને MCH કાર્ડ સાથે રાખો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      return (
        member.gender === 'female' &&
        member.is_pregnant === true &&
        (family.income_band === 'bpl' || family.income_band === 'aay' ||
         family.caste_category === 'sc' || family.caste_category === 'st')
      );
    },
  },

  // ── 12. PMKVY (Skill Development) ──
  {
    id: 'pmkvy',
    name: 'Pradhan Mantri Kaushal Vikas Yojana',
    name_hi: 'प्रधानमंत्री कौशल विकास योजना',
    name_gu: 'પ્રધાનમંત્રી કૌશલ વિકાસ યોજના',
    description: 'Free industry-relevant skill training for unemployed youth aged 15-45.',
    description_hi: '15-45 वर्ष के बेरोजगार युवाओं के लिए निःशुल्क उद्योग-संगत कौशल प्रशिक्षण।',
    description_gu: '15-45 વર્ષના બેરોજગાર યુવાનો માટે મફત ઉદ્યોગ-સંબંધિત કૌશલ્ય તાલીમ.',
    benefit: 'Free training + ₹8,000 reward on certification',
    benefit_hi: 'निःशुल्क प्रशिक्षण + प्रमाणन पर ₹8,000 पुरस्कार',
    benefit_gu: 'મફત તાલીમ + પ્રમાણપત્ર પર ₹8,000 ઈનામ',
    category: 'employment',
    triggering_fields: ['dob', 'occupation', 'education_level'],
    scope: 'member',
    next_steps: 'Register at the nearest PMKVY Training Center or apply online at pmkvyofficial.org. Carry Aadhaar and bank passbook.',
    next_steps_hi: 'निकटतम PMKVY प्रशिक्षण केंद्र में पंजीकरण करें या pmkvyofficial.org पर ऑनलाइन आवेदन करें। आधार और बैंक पासबुक लेकर जाएं।',
    next_steps_gu: 'નજીકના PMKVY તાલીમ કેન્દ્ર ખાતે નોંધણી કરાવો અથવા pmkvyofficial.org પર ઓનલાઈન અરજી કરો. આધાર અને બેંક પાસબુક સાથે રાખો.',
    eligibility_predicate: (_family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        age >= 15 && age <= 45 &&
        (member.occupation === 'unemployed' || member.occupation === 'student')
      );
    },
  },

  // ── 13. Ration Card (AAY) ──
  {
    id: 'ration_aay',
    name: 'Antyodaya Anna Yojana (AAY) Ration Card',
    name_hi: 'अंत्योदय अन्न योजना (AAY) राशन कार्ड',
    name_gu: 'અંત્યોદય અન્ન યોજના (AAY) રેશન કાર્ડ',
    description: 'Highly subsidized food grains (35 kg/month) for the poorest families.',
    description_hi: 'सबसे गरीब परिवारों के लिए अत्यधिक रियायती खाद्यान्न (35 किग्रा/माह)।',
    description_gu: 'સૌથી ગરીબ કુટુંબો માટે ભારે સબસિડીવાળા અનાજ (35 કિલો/મહિનો).',
    benefit: '35 kg food grains at ₹2-3/kg per month',
    benefit_hi: '35 किग्रा खाद्यान्न ₹2-3/किग्रा प्रति माह',
    benefit_gu: '35 કિલો અનાજ ₹2-3/કિલો દર મહિને',
    category: 'food',
    triggering_fields: ['household_income_annual', 'income_band'],
    scope: 'family',
    next_steps: 'Apply at your local Taluka Supply Office or e-Gram center with income certificate and Aadhaar of all family members.',
    next_steps_hi: 'सभी परिवार के सदस्यों के आय प्रमाण पत्र और आधार के साथ स्थानीय तालुका आपूर्ति कार्यालय या ई-ग्राम केंद्र में आवेदन करें।',
    next_steps_gu: 'બધા કુટુંબના સભ્યોના આવકનું પ્રમાણપત્ર અને આધાર સાથે સ્થાનિક તાલુકા પુરવઠા કાર્યાલય અથવા ઈ-ગ્રામ કેન્દ્ર ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family) => {
      return family.household_income_annual <= 15000;
    },
  },

  // ── 14. Ration Card (PHH/BPL) ──
  {
    id: 'ration_phh',
    name: 'Priority Household (PHH) Ration Card',
    name_hi: 'प्राथमिकता गृहस्थी (PHH) राशन कार्ड',
    name_gu: 'અગ્રતા ગૃહસ્થ (PHH) રેશન કાર્ડ',
    description: 'Subsidized food grains (5 kg/person/month) for below poverty line families.',
    description_hi: 'गरीबी रेखा से नीचे के परिवारों के लिए रियायती खाद्यान्न (5 किग्रा/व्यक्ति/माह)।',
    description_gu: 'ગરીબી રેખા નીચેના કુટુંબો માટે સબસિડીવાળા અનાજ (5 કિલો/વ્યક્તિ/મહિનો).',
    benefit: '5 kg food grains per person per month at subsidized rates',
    benefit_hi: 'रियायती दरों पर प्रति व्यक्ति प्रति माह 5 किग्रा खाद्यान्न',
    benefit_gu: 'સબસિડી દરે દરેક વ્યક્તિ દીઠ દર મહિને 5 કિલો અનાજ',
    category: 'food',
    triggering_fields: ['household_income_annual', 'income_band'],
    scope: 'family',
    next_steps: 'Apply at your local Taluka Supply Office with income certificate and family details.',
    next_steps_hi: 'आय प्रमाण पत्र और परिवार के विवरण के साथ स्थानीय तालुका आपूर्ति कार्यालय में आवेदन करें।',
    next_steps_gu: 'આવકનું પ્રમાણપત્ર અને કુટુંબની વિગતો સાથે સ્થાનિક તાલુકા પુરવઠા કાર્યાલય ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family) => {
      return family.household_income_annual > 15000 && family.household_income_annual <= 100000;
    },
  },

  // ── 15. Pre-Matric Scholarship (SC/ST) ──
  {
    id: 'pre_matric_sc_st',
    name: 'Pre-Matric Scholarship (SC/ST)',
    name_hi: 'मैट्रिक-पूर्व छात्रवृत्ति (अनु.जाति/अनु.जनजाति)',
    name_gu: 'મેટ્રિક પહેલાંની શિષ્યવૃત્તિ (SC/ST)',
    description: 'Scholarship for SC/ST school-age children (Class 1-10) to promote education.',
    description_hi: 'शिक्षा को बढ़ावा देने के लिए अनु.जाति/अनु.जनजाति के स्कूली बच्चों (कक्षा 1-10) के लिए छात्रवृत्ति।',
    description_gu: 'શિક્ષણને પ્રોત્સાહન આપવા SC/ST ના શાળાના બાળકો (ધોરણ 1-10) માટે શિષ્યવૃત્તિ.',
    benefit: '₹150-750/month + annual ad hoc grant',
    benefit_hi: '₹150-750/माह + वार्षिक तदर्थ अनुदान',
    benefit_gu: '₹150-750/મહિનો + વાર્ષિક એડ-હોક ગ્રાન્ટ',
    category: 'scholarship',
    triggering_fields: ['dob', 'caste_category', 'education_level'],
    scope: 'member',
    next_steps: 'Apply through school or online at the National Scholarship Portal (scholarships.gov.in).',
    next_steps_hi: 'स्कूल के माध्यम से या राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) पर ऑनलाइन आवेदन करें।',
    next_steps_gu: 'શાળા મારફતે અથવા રાષ્ટ્રીય શિષ્યવૃત્તિ પોર્ટલ (scholarships.gov.in) પર ઓનલાઈન અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        (family.caste_category === 'sc' || family.caste_category === 'st') &&
        age >= 6 && age <= 16 &&
        (member.education_level === 'none' || member.education_level === 'primary' || member.education_level === 'secondary') &&
        family.household_income_annual <= 200000
      );
    },
  },

  // ── 16. Manav Garima Yojana ──
  {
    id: 'manav_garima',
    name: 'Manav Garima Yojana',
    name_hi: 'मानव गरिमा योजना',
    name_gu: 'માનવ ગરિમા યોજના',
    description: 'Self-employment kit/tools worth ₹4,000 for SC/ST/OBC BPL individuals.',
    description_hi: 'अनु.जाति/अनु.जनजाति/ओबीसी बीपीएल व्यक्तियों के लिए ₹4,000 मूल्य की स्व-रोजगार किट/उपकरण।',
    description_gu: 'SC/ST/OBC BPL વ્યક્તિઓ માટે ₹4,000ની સ્વ-રોજગાર કીટ/સાધનો.',
    benefit: 'Equipment/tools kit worth ₹4,000',
    benefit_hi: '₹4,000 मूल्य के उपकरण/औजार किट',
    benefit_gu: '₹4,000ની કીંમતના સાધનો/ઓજારોની કીટ',
    category: 'employment',
    triggering_fields: ['is_bpl', 'caste_category', 'occupation'],
    scope: 'member',
    next_steps: 'Apply at District Social Welfare Office with BPL certificate, caste certificate, and Aadhaar.',
    next_steps_hi: 'बीपीएल प्रमाण पत्र, जाति प्रमाण पत्र और आधार के साथ जिला समाज कल्याण कार्यालय में आवेदन करें।',
    next_steps_gu: 'BPL પ્રમાણપત્ર, જાતિ પ્રમાણપત્ર અને આધાર સાથે જિલ્લા સમાજ કલ્યાણ કાર્યાલય ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        age >= 18 &&
        (family.caste_category === 'sc' || family.caste_category === 'st' || family.caste_category === 'obc') &&
        (family.income_band === 'bpl' || family.income_band === 'aay')
      );
    },
  },

  // ── 17. Palak Mata Pita Yojana (Orphan Support) ──
  {
    id: 'palak_mata_pita',
    name: 'Palak Mata Pita Yojana',
    name_hi: 'पालक माता पिता योजना',
    name_gu: 'પાલક માતા પિતા યોજના',
    description: 'Monthly assistance of ₹3,000 for orphaned children under 18.',
    description_hi: '18 वर्ष से कम उम्र के अनाथ बच्चों के लिए ₹3,000 मासिक सहायता।',
    description_gu: '18 વર્ષથી ઓછી ઉંમરના અનાથ બાળકો માટે ₹3,000 માસિક સહાય.',
    benefit: '₹3,000/month per child',
    benefit_hi: '₹3,000/माह प्रति बच्चा',
    benefit_gu: '₹3,000/મહિનો દરેક બાળક દીઠ',
    category: 'social',
    triggering_fields: ['is_alive', 'relation_to_head', 'dob'],
    scope: 'member',
    next_steps: 'Apply at District Child Protection Unit with orphan certificate, guardian\'s Aadhaar, and income certificate.',
    next_steps_hi: 'अनाथ प्रमाण पत्र, अभिभावक का आधार और आय प्रमाण पत्र के साथ जिला बाल संरक्षण इकाई में आवेदन करें।',
    next_steps_gu: 'અનાથ પ્રમાણપત્ર, વાલીનું આધાર અને આવકનું પ્રમાણપત્ર સાથે જિલ્લા બાળ સંરક્ષણ એકમ ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      // Check if both parents are not alive
      const headAlive = family.members.some(m => m.relation_to_head === 'head' && m.is_alive);
      const spouseAlive = family.members.some(m => m.relation_to_head === 'spouse' && m.is_alive);
      const isOrphan = !headAlive || !spouseAlive; // At least one parent deceased
      return (
        member.relation_to_head === 'child' &&
        age < 18 &&
        isOrphan &&
        family.household_income_annual <= 120000
      );
    },
  },

  // ── 18. Kanya Kelavni (Girl Education Incentive) ──
  {
    id: 'kanya_kelavni',
    name: 'Kanya Kelavni Mahotsav',
    name_hi: 'कन्या केलवणी महोत्सव',
    name_gu: 'કન્યા કેળવણી મહોત્સવ',
    description: 'Education incentives for girl children from BPL families to promote school enrollment and retention.',
    description_hi: 'स्कूल नामांकन और प्रतिधारण को बढ़ावा देने के लिए बीपीएल परिवारों की बालिकाओं के लिए शिक्षा प्रोत्साहन।',
    description_gu: 'શાળા નોંધણી અને ટકાવારી વધારવા BPL કુટુંબોની બાળકીઓ માટે શિક્ષણ પ્રોત્સાહન.',
    benefit: '₹3,000-5,000 annual education support',
    benefit_hi: '₹3,000-5,000 वार्षिक शिक्षा सहायता',
    benefit_gu: '₹3,000-5,000 વાર્ષિક શિક્ષણ સહાય',
    category: 'scholarship',
    triggering_fields: ['gender', 'dob', 'is_bpl', 'education_level'],
    scope: 'member',
    next_steps: 'Enroll through the school. Teachers and BLOs will facilitate enrollment during Kanya Kelavni campaigns.',
    next_steps_hi: 'स्कूल के माध्यम से नामांकन करें। शिक्षक और BLO कन्या केलवणी अभियान के दौरान नामांकन में सहायता करेंगे।',
    next_steps_gu: 'શાળા મારફતે નોંધણી કરાવો. શિક્ષકો અને BLO કન્યા કેળવણી અભિયાન દરમિયાન નોંધણીમાં મદદ કરશે.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        member.gender === 'female' &&
        member.relation_to_head === 'child' &&
        age >= 6 && age <= 18 &&
        (family.income_band === 'bpl' || family.income_band === 'aay')
      );
    },
  },

  // ── 19. Indira Gandhi National Widow Pension ──
  {
    id: 'ignwps',
    name: 'Indira Gandhi National Widow Pension Scheme',
    name_hi: 'इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना',
    name_gu: 'ઈન્દિરા ગાંધી રાષ્ટ્રીય વિધવા પેન્શન યોજના',
    description: 'Central government pension of ₹300/month for BPL widows aged 40-79.',
    description_hi: 'बीपीएल 40-79 वर्ष की विधवाओं को केंद्र सरकार की ₹300/माह पेंशन।',
    description_gu: 'BPL 40-79 વર્ષની વિધવાઓને કેન્દ્ર સરકારની ₹300/માસ પેન્શન.',
    benefit: '₹300/month (central) + state top-up',
    benefit_hi: '₹300/माह (केंद्रीय) + राज्य अतिरिक्त',
    benefit_gu: '₹300/મહિનો (કેન્દ્રીય) + રાજ્ય ટોપ-અપ',
    category: 'pension',
    triggering_fields: ['marital_status', 'dob', 'is_bpl'],
    scope: 'member',
    next_steps: 'Apply at District Social Welfare Office or Taluka office with Aadhaar, BPL card, and husband\'s death certificate.',
    next_steps_hi: 'आधार, बीपीएल कार्ड और पति का मृत्यु प्रमाण पत्र के साथ जिला समाज कल्याण कार्यालय या तालुका कार्यालय में आवेदन करें।',
    next_steps_gu: 'આધાર, BPL કાર્ડ અને પતિનું મૃત્યુ પ્રમાણપત્ર સાથે જિલ્લા સમાજ કલ્યાણ કાર્યાલય અથવા તાલુકા કાર્યાલય ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        member.gender === 'female' &&
        member.marital_status === 'widowed' &&
        age >= 40 && age <= 79 &&
        (family.income_band === 'bpl' || family.income_band === 'aay')
      );
    },
  },

  // ── 20. Indira Gandhi National Disability Pension ──
  {
    id: 'igndps',
    name: 'Indira Gandhi National Disability Pension Scheme',
    name_hi: 'इंदिरा गांधी राष्ट्रीय विकलांगता पेंशन योजना',
    name_gu: 'ઈન્દિરા ગાંધી રાષ્ટ્રીય દિવ્યાંગતા પેન્શન યોજના',
    description: 'Central government pension of ₹300/month for BPL persons aged 18-79 with severe disability (80%+).',
    description_hi: 'गंभीर विकलांगता (80%+) वाले 18-79 वर्ष के बीपीएल व्यक्तियों को केंद्र सरकार की ₹300/माह पेंशन।',
    description_gu: 'ગંભીર દિવ્યાંગતા (80%+) ધરાવતા 18-79 વર્ષના BPL વ્યક્તિઓને કેન્દ્ર સરકારની ₹300/માસ પેન્શન.',
    benefit: '₹300/month (central) + state top-up',
    benefit_hi: '₹300/माह (केंद्रीय) + राज्य अतिरिक्त',
    benefit_gu: '₹300/મહિનો (કેન્દ્રીય) + રાજ્ય ટોપ-અપ',
    category: 'pension',
    triggering_fields: ['disability_status', 'dob', 'is_bpl'],
    scope: 'member',
    next_steps: 'Apply at District Social Welfare Office with Aadhaar, disability certificate (80%+), BPL card, and bank passbook.',
    next_steps_hi: 'आधार, विकलांगता प्रमाण पत्र (80%+), बीपीएल कार्ड और बैंक पासबुक के साथ जिला समाज कल्याण कार्यालय में आवेदन करें।',
    next_steps_gu: 'આધાર, દિવ્યાંગતા પ્રમાણપત્ર (80%+), BPL કાર્ડ અને બેંક પાસબુક સાથે જિલ્લા સમાજ કલ્યાણ કાર્યાલય ખાતે અરજી કરો.',
    eligibility_predicate: (family: Family, member?: FamilyMember) => {
      if (!member || !member.is_alive) return false;
      const age = getAge(member.dob);
      return (
        member.disability_status &&
        (member.disability_percentage ?? 0) >= 80 &&
        age >= 18 && age <= 79 &&
        (family.income_band === 'bpl' || family.income_band === 'aay')
      );
    },
  },
];

// Export helper for looking up a scheme by ID
export function getSchemeById(id: string): SchemeRule | undefined {
  return schemeRules.find(s => s.id === id);
}

// Export scheme count for dashboard stats
export const TOTAL_SCHEMES = schemeRules.length;

// Export the age helper for use in other modules
export { getAge };
