// ============================================================
// Family ID Copilot — Life Event Definitions
// ============================================================

import type { Family, FamilyMember, LifeEvent, LifeEventParams, Gender } from './types';

/**
 * Deep clone a family object for simulation without mutating the original.
 */
function cloneFamily(family: Family): Family {
  return JSON.parse(JSON.stringify(family));
}

/**
 * Compute an ISO date string for someone who is `age` years old today.
 */
function dobForAge(age: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d.toISOString().split('T')[0];
}

function generateMemberId(): string {
  return 'MEM' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getIncomeBand(income: number): 'aay' | 'bpl' | 'lig' | 'mig' | 'hig' {
  if (income <= 15000) return 'aay';
  if (income <= 100000) return 'bpl';
  if (income <= 300000) return 'lig';
  if (income <= 600000) return 'mig';
  return 'hig';
}

// ---------- Life Event Definitions ----------

export const lifeEvents: LifeEvent[] = [
  {
    type: 'member_turns_18',
    label: 'Member Turns 18',
    label_hi: 'सदस्य 18 वर्ष का हुआ',
    label_gu: 'સભ્ય 18 વર્ષના થયા',
    description: 'A family member reaches the age of 18, unlocking adult-age schemes.',
    requires_member_selection: true,
    icon: 'Cake',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.dob = dobForAge(18);
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'member_turns_60',
    label: 'Member Turns 60',
    label_hi: 'सदस्य 60 वर्ष का हुआ',
    label_gu: 'સભ્ય 60 વર્ષના થયા',
    description: 'A family member reaches the age of 60, becoming eligible for old-age pensions.',
    requires_member_selection: true,
    icon: 'UserRound',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.dob = dobForAge(60);
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'marital_status_widowed',
    label: 'Marital Status → Widowed',
    label_hi: 'वैवाहिक स्थिति → विधवा',
    label_gu: 'વૈવાહિક સ્થિતિ → વિધવા',
    description: 'A family member becomes widowed, potentially unlocking widow pension schemes.',
    requires_member_selection: true,
    icon: 'HeartCrack',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.marital_status = 'widowed';
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'new_child_born',
    label: 'New Child Born',
    label_hi: 'नए बच्चे का जन्म',
    label_gu: 'નવા બાળકનો જન્મ',
    description: 'A new child is born into the family, potentially unlocking child-related schemes.',
    requires_member_selection: false,
    icon: 'Baby',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      const gender: Gender = params?.child_gender || 'female';
      const name = params?.child_name || (gender === 'female' ? 'Baby Girl' : 'Baby Boy');
      const newMember: FamilyMember = {
        member_id: generateMemberId(),
        family_id: f.family_id,
        name,
        relation_to_head: 'child',
        dob: new Date().toISOString().split('T')[0],
        gender,
        marital_status: 'single',
        occupation: 'none',
        disability_status: false,
        education_level: 'none',
        is_bpl: f.income_band === 'bpl' || f.income_band === 'aay',
        is_alive: true,
      };
      f.members.push(newMember);
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'disability_recorded',
    label: 'Disability Recorded',
    label_hi: 'विकलांगता दर्ज',
    label_gu: 'દિવ્યાંગતા નોંધાઈ',
    description: 'A family member is certified with a disability, unlocking disability schemes.',
    requires_member_selection: true,
    icon: 'Accessibility',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.disability_status = true;
        member.disability_percentage = 80; // Severe disability
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'income_decreased',
    label: 'Income Decreased',
    label_hi: 'आय में कमी',
    label_gu: 'આવકમાં ઘટાડો',
    description: 'Household income drops, potentially qualifying for more BPL-conditional schemes.',
    requires_member_selection: false,
    icon: 'TrendingDown',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      const newIncome = params?.new_income ?? Math.max(15000, f.household_income_annual * 0.4);
      f.household_income_annual = newIncome;
      f.income_band = getIncomeBand(newIncome);
      // Update BPL status for all members
      const isBpl = f.income_band === 'bpl' || f.income_band === 'aay';
      f.members.forEach(m => { m.is_bpl = isBpl; });
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'income_increased',
    label: 'Income Increased',
    label_hi: 'आय में वृद्धि',
    label_gu: 'આવકમાં વધારો',
    description: 'Household income rises, potentially disqualifying from BPL-conditional schemes.',
    requires_member_selection: false,
    icon: 'TrendingUp',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      const newIncome = params?.new_income ?? f.household_income_annual * 2.5;
      f.household_income_annual = newIncome;
      f.income_band = getIncomeBand(newIncome);
      const isBpl = f.income_band === 'bpl' || f.income_band === 'aay';
      f.members.forEach(m => { m.is_bpl = isBpl; });
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'breadwinner_death',
    label: 'Death of Breadwinner',
    label_hi: 'मुख्य कमाने वाले की मृत्यु',
    label_gu: 'મુખ્ય કમાનાર વ્યક્તિનું મૃત્યુ',
    description: 'The head of household passes away, triggering NFBS and other survivor benefits.',
    requires_member_selection: true,
    icon: 'Skull',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.is_alive = false;
      }
      // If spouse exists, update their marital status
      const spouse = f.members.find(m => m.relation_to_head === 'spouse' && m.is_alive);
      if (spouse && member?.relation_to_head === 'head') {
        spouse.marital_status = 'widowed';
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'child_starts_school',
    label: 'Child Starts School',
    label_hi: 'बच्चा स्कूल शुरू करता है',
    label_gu: 'બાળક શાળા શરૂ કરે છે',
    description: 'A child reaches school age (6+), unlocking education scholarships.',
    requires_member_selection: true,
    icon: 'GraduationCap',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.dob = dobForAge(6);
        member.education_level = 'primary';
        member.occupation = 'student';
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'child_starts_college',
    label: 'Child Starts College',
    label_hi: 'बच्चा कॉलेज शुरू करता है',
    label_gu: 'બાળક કોલેજ શરૂ કરે છે',
    description: 'A child reaches college age (17+), unlocking post-matric scholarships.',
    requires_member_selection: true,
    icon: 'BookOpen',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.dob = dobForAge(18);
        member.education_level = 'higher_secondary';
        member.occupation = 'student';
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
  {
    type: 'pregnancy_recorded',
    label: 'Pregnancy Recorded',
    label_hi: 'गर्भावस्था दर्ज',
    label_gu: 'ગર્ભાવસ્થા નોંધાઈ',
    description: 'A female member\'s pregnancy is recorded, unlocking maternity benefit schemes.',
    requires_member_selection: true,
    icon: 'Heart',
    apply: (family: Family, params?: LifeEventParams): Family => {
      const f = cloneFamily(family);
      if (!params?.member_id) return f;
      const member = f.members.find(m => m.member_id === params.member_id);
      if (member) {
        member.is_pregnant = true;
      }
      f.last_updated = new Date().toISOString();
      return f;
    },
  },
];

/**
 * Get a life event definition by type.
 */
export function getLifeEventByType(type: string): LifeEvent | undefined {
  return lifeEvents.find(e => e.type === type);
}

/**
 * Calculate age in years from ISO date string.
 */
export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Filter family members who are logically eligible for a specific life transition.
 */
export function getEligibleMembersForEvent(family: Family, eventType: string): FamilyMember[] {
  const alive = family.members.filter(m => m.is_alive);
  switch (eventType) {
    case 'member_turns_18':
      return alive.filter(m => calculateAge(m.dob) < 18);
    case 'member_turns_60':
      return alive.filter(m => calculateAge(m.dob) < 60);
    case 'marital_status_widowed':
      return alive.filter(m => m.marital_status === 'married');
    case 'breadwinner_death':
      return alive.filter(m => calculateAge(m.dob) >= 18);
    case 'disability_recorded':
      return alive.filter(m => !m.disability_status);
    case 'pregnancy_recorded':
      return alive.filter(m => m.gender === 'female' && calculateAge(m.dob) >= 18 && calculateAge(m.dob) <= 49 && !m.is_pregnant);
    case 'child_starts_school':
      return alive.filter(m => m.relation_to_head === 'child' && calculateAge(m.dob) <= 9);
    case 'child_starts_college':
      return alive.filter(m => (m.relation_to_head === 'child' || calculateAge(m.dob) <= 24) && calculateAge(m.dob) >= 15);
    default:
      return alive;
  }
}

/**
 * Strict logical validation of life events to prevent impossible states or duplicate additions.
 */
export function validateLifeEvent(
  family: Family,
  eventType: string,
  params?: LifeEventParams
): { valid: boolean; error?: string } {
  switch (eventType) {
    case 'new_child_born': {
      const name = params?.child_name?.trim();
      if (!name) {
        return { valid: false, error: 'Please enter a name for the newborn child.' };
      }
      const existing = family.members.find(m => {
        const mNorm = m.name.trim().toLowerCase();
        const iNorm = name.toLowerCase();
        const mFirst = mNorm.split(/\s+/)[0];
        const iFirst = iNorm.split(/\s+/)[0];
        return mNorm === iNorm || (mFirst.length > 2 && mFirst === iFirst);
      });
      if (existing) {
        return {
          valid: false,
          error: `A family member named "${existing.name}" (${existing.relation_to_head}, ${calculateAge(existing.dob)} yrs) is already registered in this household. Please provide a distinct name.`,
        };
      }
      return { valid: true };
    }

    case 'member_turns_18': {
      if (!params?.member_id) return { valid: false, error: 'Please select a family member.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (!member.is_alive) return { valid: false, error: `${member.name} is recorded as deceased.` };
      const age = calculateAge(member.dob);
      if (age >= 18) {
        return { valid: false, error: `${member.name} is already ${age} years old and cannot turn 18.` };
      }
      return { valid: true };
    }

    case 'member_turns_60': {
      if (!params?.member_id) return { valid: false, error: 'Please select a family member.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (!member.is_alive) return { valid: false, error: `${member.name} is recorded as deceased.` };
      const age = calculateAge(member.dob);
      if (age >= 60) {
        return { valid: false, error: `${member.name} is already ${age} years old and cannot turn 60.` };
      }
      return { valid: true };
    }

    case 'marital_status_widowed': {
      if (!params?.member_id) return { valid: false, error: 'Please select a family member.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (!member.is_alive) return { valid: false, error: `${member.name} is recorded as deceased.` };
      if (member.marital_status === 'widowed') {
        return { valid: false, error: `${member.name} is already recorded as widowed.` };
      }
      if (member.marital_status === 'single') {
        return { valid: false, error: `${member.name} is single/unmarried and cannot transition to widowed.` };
      }
      return { valid: true };
    }

    case 'breadwinner_death': {
      if (!params?.member_id) return { valid: false, error: 'Please select a family member.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (!member.is_alive) {
        return { valid: false, error: `${member.name} is already recorded as deceased.` };
      }
      return { valid: true };
    }

    case 'disability_recorded': {
      if (!params?.member_id) return { valid: false, error: 'Please select a family member.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (member.disability_status) {
        return { valid: false, error: `${member.name} already has a certified disability on file.` };
      }
      return { valid: true };
    }

    case 'pregnancy_recorded': {
      if (!params?.member_id) return { valid: false, error: 'Please select a family member.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (member.gender !== 'female') {
        return { valid: false, error: 'Pregnancy can only be recorded for female members.' };
      }
      if (member.is_pregnant) {
        return { valid: false, error: `${member.name} is already recorded as pregnant.` };
      }
      return { valid: true };
    }

    case 'income_decreased': {
      if (params?.new_income !== undefined && params.new_income >= family.household_income_annual) {
        return {
          valid: false,
          error: `Simulated new income (₹${params.new_income.toLocaleString('en-IN')}) must be lower than current income (₹${family.household_income_annual.toLocaleString('en-IN')}).`,
        };
      }
      return { valid: true };
    }

    case 'income_increased': {
      if (params?.new_income !== undefined && params.new_income <= family.household_income_annual) {
        return {
          valid: false,
          error: `Simulated new income (₹${params.new_income.toLocaleString('en-IN')}) must be higher than current income (₹${family.household_income_annual.toLocaleString('en-IN')}).`,
        };
      }
      return { valid: true };
    }

    case 'child_starts_school': {
      if (!params?.member_id) return { valid: false, error: 'Please select a child.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (!member.is_alive) return { valid: false, error: `${member.name} is recorded as deceased.` };
      const age = calculateAge(member.dob);
      if (age > 12) {
        return { valid: false, error: `${member.name} is already ${age} years old and past the initial primary school entry window.` };
      }
      return { valid: true };
    }

    case 'child_starts_college': {
      if (!params?.member_id) return { valid: false, error: 'Please select a member.' };
      const member = family.members.find(m => m.member_id === params.member_id);
      if (!member) return { valid: false, error: 'Selected member not found.' };
      if (!member.is_alive) return { valid: false, error: `${member.name} is recorded as deceased.` };
      const age = calculateAge(member.dob);
      if (age < 15) {
        return { valid: false, error: `${member.name} is only ${age} years old and cannot commence higher secondary or college.` };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}

