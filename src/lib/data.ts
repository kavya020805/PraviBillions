// ============================================================
// Family ID Copilot — Synthetic Family Dataset
// 50 families, 200+ members, 5 pre-seeded duplicate pairs
// All data is SYNTHETIC — modeled on real Gujarat demographics
// ============================================================

import type { Family, FamilyMember, LifeEventLogEntry, DuplicatePair, DuplicateWeights, DuplicateStatus } from './types';
import { scanForDuplicates, DEFAULT_WEIGHTS } from './matching-engine';
import { evaluateEligibility } from './rules-engine';
import { getUniqueEligibleSchemeIds } from './rules-engine';
import {
  upsertFamilyToSupabase,
  logEventToSupabase,
  updateDuplicateStatusInSupabase,
  fetchFamiliesFromSupabase,
} from './supabase/db';

// ---------- Gujarat Districts ----------
const DISTRICTS = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
  'Jamnagar', 'Junagadh', 'Gandhinagar', 'Kutch', 'Mehsana',
  'Patan', 'Banaskantha', 'Sabarkantha', 'Kheda', 'Anand',
  'Bharuch', 'Narmada', 'Navsari', 'Valsad', 'Dangs',
];

// ---------- Helper Functions ----------

function dob(yearsAgo: number, monthOffset = 0, dayOffset = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() + monthOffset);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

function member(
  id: string, familyId: string, name: string,
  relation: FamilyMember['relation_to_head'],
  age: number, gender: FamilyMember['gender'],
  overrides: Partial<FamilyMember> = {}
): FamilyMember {
  return {
    member_id: id,
    family_id: familyId,
    name,
    relation_to_head: relation,
    dob: dob(age),
    gender,
    marital_status: overrides.marital_status || (relation === 'child' ? 'single' : 'married'),
    occupation: overrides.occupation || (relation === 'child' ? 'student' : 'farmer'),
    disability_status: overrides.disability_status || false,
    disability_percentage: overrides.disability_percentage,
    education_level: overrides.education_level || 'secondary',
    is_bpl: overrides.is_bpl ?? false,
    is_alive: overrides.is_alive ?? true,
    is_pregnant: overrides.is_pregnant,
  };
}

// ============================================================
// THE 50 FAMILIES
// ============================================================

export const syntheticFamilies: Family[] = [
  // ── 1. THE PATEL FAMILY (Primary Demo Family) ──
  {
    family_id: '240100000001',
    district: 'Ahmedabad',
    household_income_annual: 110000,
    income_band: 'lig',
    caste_category: 'obc',
    land_owned_acres: 1.5,
    house_type: 'kutcha',
    phone_number: '9876543210',
    address: '42, Mahatma Gandhi Road, Navrangpura',
    pincode: '380009',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM001', '240100000001', 'Rameshbhai Patel', 'head', 57, 'male', { occupation: 'shopkeeper', education_level: 'secondary' }),
      member('MEM002', '240100000001', 'Savitaben Patel', 'spouse', 54, 'female', { occupation: 'homemaker', education_level: 'primary' }),
      member('MEM003', '240100000001', 'Vikram Patel', 'child', 17, 'male', { occupation: 'student', education_level: 'secondary' }),
      member('MEM004', '240100000001', 'Priya Patel', 'child', 14, 'female', { occupation: 'student', education_level: 'secondary' }),
      member('MEM005', '240100000001', 'Kantaben Patel', 'parent', 78, 'female', { marital_status: 'widowed', occupation: 'none', education_level: 'none' }),
    ],
  },

  // ── 2. THE SHAH FAMILY ──
  {
    family_id: '240100000002',
    district: 'Ahmedabad',
    household_income_annual: 350000,
    income_band: 'mig',
    caste_category: 'general',
    land_owned_acres: 0,
    house_type: 'pucca',
    phone_number: '9876543211',
    address: '15, Satellite Road, Jodhpur',
    pincode: '380015',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM006', '240100000002', 'Mehul Shah', 'head', 45, 'male', { occupation: 'business', education_level: 'graduate' }),
      member('MEM007', '240100000002', 'Dimple Shah', 'spouse', 42, 'female', { occupation: 'teacher', education_level: 'graduate' }),
      member('MEM008', '240100000002', 'Rishi Shah', 'child', 20, 'male', { occupation: 'student', education_level: 'higher_secondary' }),
      member('MEM009', '240100000002', 'Aanya Shah', 'child', 16, 'female', { occupation: 'student', education_level: 'secondary' }),
    ],
  },

  // ── 3. THE DESAI FAMILY (BPL, SC) ──
  {
    family_id: '240100000003',
    district: 'Surat',
    household_income_annual: 80000,
    income_band: 'bpl',
    caste_category: 'sc',
    land_owned_acres: 0.5,
    house_type: 'kutcha',
    phone_number: '9876543212',
    address: '78, Ambedkar Nagar, Rander',
    pincode: '395005',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM010', '240100000003', 'Bharat Desai', 'head', 38, 'male', { occupation: 'laborer', education_level: 'primary', is_bpl: true }),
      member('MEM011', '240100000003', 'Meena Desai', 'spouse', 35, 'female', { occupation: 'homemaker', education_level: 'none', is_bpl: true }),
      member('MEM012', '240100000003', 'Rohan Desai', 'child', 12, 'male', { occupation: 'student', education_level: 'primary', is_bpl: true }),
      member('MEM013', '240100000003', 'Kavya Desai', 'child', 8, 'female', { occupation: 'student', education_level: 'primary', is_bpl: true }),
      member('MEM014', '240100000003', 'Baby Desai', 'child', 2, 'female', { occupation: 'none', education_level: 'none', is_bpl: true }),
    ],
  },

  // ── 4. THE PRAJAPATI FAMILY (ST, Rural) ──
  {
    family_id: '240100000004',
    district: 'Dangs',
    household_income_annual: 60000,
    income_band: 'bpl',
    caste_category: 'st',
    land_owned_acres: 3,
    house_type: 'kutcha',
    phone_number: '9876543213',
    address: 'Village Waghai, Taluka Waghai',
    pincode: '394730',
    area_type: 'rural',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM015', '240100000004', 'Dinesh Prajapati', 'head', 50, 'male', { occupation: 'farmer', education_level: 'primary', is_bpl: true }),
      member('MEM016', '240100000004', 'Kamla Prajapati', 'spouse', 47, 'female', { occupation: 'farmer', education_level: 'none', is_bpl: true }),
      member('MEM017', '240100000004', 'Suresh Prajapati', 'child', 19, 'male', { occupation: 'student', education_level: 'higher_secondary', is_bpl: true }),
      member('MEM018', '240100000004', 'Geeta Prajapati', 'child', 15, 'female', { occupation: 'student', education_level: 'secondary', is_bpl: true }),
      member('MEM019', '240100000004', 'Ramu Prajapati', 'parent', 75, 'male', { occupation: 'none', education_level: 'none', is_bpl: true, marital_status: 'widowed' }),
    ],
  },

  // ── 5. THE SHARMA FAMILY (Widow-headed household) ──
  {
    family_id: '240100000005',
    district: 'Vadodara',
    household_income_annual: 70000,
    income_band: 'bpl',
    caste_category: 'obc',
    land_owned_acres: 0,
    house_type: 'kutcha',
    phone_number: '9876543214',
    address: '23, Waghodia Road, Vadodara',
    pincode: '390019',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM020', '240100000005', 'Late Rajesh Sharma', 'head', 45, 'male', { occupation: 'none', is_alive: false, is_bpl: true }),
      member('MEM021', '240100000005', 'Sunita Sharma', 'spouse', 42, 'female', { occupation: 'tailor', marital_status: 'widowed', education_level: 'secondary', is_bpl: true }),
      member('MEM022', '240100000005', 'Arjun Sharma', 'child', 16, 'male', { occupation: 'student', education_level: 'secondary', is_bpl: true }),
      member('MEM023', '240100000005', 'Neha Sharma', 'child', 12, 'female', { occupation: 'student', education_level: 'primary', is_bpl: true }),
    ],
  },

  // ── 6-10: DUPLICATE PAIR GROUP 1 (Patel variants) ──
  // Family 6: Near-duplicate of Family 1 (different spelling, same phone)
  {
    family_id: '240100000006',
    district: 'Ahmedabad',
    household_income_annual: 115000,
    income_band: 'lig',
    caste_category: 'obc',
    land_owned_acres: 1.5,
    house_type: 'kutcha',
    phone_number: '9876543210', // SAME phone as Family 1!
    address: '42, M.G. Road, Navrangpura', // Slightly different address format
    pincode: '380009',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM024', '240100000006', 'Ramesh Kumar Patel', 'head', 57, 'male', { occupation: 'shopkeeper', education_level: 'secondary' }), // Name variant
      member('MEM025', '240100000006', 'Savita Patel', 'spouse', 54, 'female', { occupation: 'homemaker', education_level: 'primary' }), // Name variant
      member('MEM026', '240100000006', 'Vikram Patel', 'child', 17, 'male', { occupation: 'student', education_level: 'secondary' }),
    ],
  },

  // ── 7: Another family ──
  {
    family_id: '240100000007',
    district: 'Rajkot',
    household_income_annual: 250000,
    income_band: 'lig',
    caste_category: 'general',
    land_owned_acres: 5,
    house_type: 'pucca',
    phone_number: '9876543215',
    address: '101, Kalawad Road, Rajkot',
    pincode: '360005',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM027', '240100000007', 'Jayesh Joshi', 'head', 52, 'male', { occupation: 'business', education_level: 'graduate' }),
      member('MEM028', '240100000007', 'Reena Joshi', 'spouse', 48, 'female', { occupation: 'homemaker', education_level: 'higher_secondary' }),
      member('MEM029', '240100000007', 'Karan Joshi', 'child', 24, 'male', { occupation: 'engineer', education_level: 'graduate', marital_status: 'single' }),
    ],
  },

  // ── 8: Duplicate Pair 2 — Desai variant ──
  {
    family_id: '240100000008',
    district: 'Surat',
    household_income_annual: 85000,
    income_band: 'bpl',
    caste_category: 'sc',
    land_owned_acres: 0.5,
    house_type: 'kutcha',
    phone_number: '9876543212', // SAME phone as Family 3!
    address: '78, Dr Ambedkar Nagar, Rander Road', // Variant address
    pincode: '395005',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM030', '240100000008', 'Bharat Kumar Desai', 'head', 38, 'male', { occupation: 'laborer', education_level: 'primary', is_bpl: true }),
      member('MEM031', '240100000008', 'Meenaben Desai', 'spouse', 35, 'female', { occupation: 'homemaker', education_level: 'none', is_bpl: true }),
      member('MEM032', '240100000008', 'Rohan Desai', 'child', 12, 'male', { occupation: 'student', education_level: 'primary', is_bpl: true }),
    ],
  },

  // ── 9: Independent family ──
  {
    family_id: '240100000009',
    district: 'Bhavnagar',
    household_income_annual: 180000,
    income_band: 'lig',
    caste_category: 'general',
    land_owned_acres: 2,
    house_type: 'pucca',
    phone_number: '9876543216',
    address: '56, Kalanala, Bhavnagar',
    pincode: '364001',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM033', '240100000009', 'Kishan Vaghela', 'head', 40, 'male', { occupation: 'teacher', education_level: 'graduate' }),
      member('MEM034', '240100000009', 'Nisha Vaghela', 'spouse', 37, 'female', { occupation: 'nurse', education_level: 'graduate' }),
      member('MEM035', '240100000009', 'Dhruv Vaghela', 'child', 10, 'male', { occupation: 'student', education_level: 'primary' }),
    ],
  },

  // ── 10: Duplicate Pair 3 — Prajapati variant ──
  {
    family_id: '240100000010',
    district: 'Dangs',
    household_income_annual: 62000,
    income_band: 'bpl',
    caste_category: 'st',
    land_owned_acres: 3,
    house_type: 'kutcha',
    phone_number: '9876543217',
    address: 'Waghai Village, Waghai Taluka', // Variant address
    pincode: '394730', // Same pincode
    area_type: 'rural',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM036', '240100000010', 'Dineshbhai Prajapati', 'head', 50, 'male', { occupation: 'farmer', education_level: 'primary', is_bpl: true }), // Name variant
      member('MEM037', '240100000010', 'Kamlaben Prajapati', 'spouse', 47, 'female', { occupation: 'farmer', education_level: 'none', is_bpl: true }),
    ],
  },

  // ── 11-20: More diverse families ──
  {
    family_id: '240100000011',
    district: 'Gandhinagar',
    household_income_annual: 450000,
    income_band: 'mig',
    caste_category: 'general',
    land_owned_acres: 0,
    house_type: 'pucca',
    phone_number: '9876543218',
    address: '12, Sector 21, Gandhinagar',
    pincode: '382021',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM038', '240100000011', 'Amit Trivedi', 'head', 48, 'male', { occupation: 'government_officer', education_level: 'post_graduate' }),
      member('MEM039', '240100000011', 'Priti Trivedi', 'spouse', 44, 'female', { occupation: 'teacher', education_level: 'graduate' }),
      member('MEM040', '240100000011', 'Shreya Trivedi', 'child', 18, 'female', { occupation: 'student', education_level: 'higher_secondary' }),
    ],
  },

  {
    family_id: '240100000012',
    district: 'Kutch',
    household_income_annual: 45000,
    income_band: 'bpl',
    caste_category: 'st',
    land_owned_acres: 8,
    house_type: 'kutcha',
    phone_number: '9876543219',
    address: 'Village Banni, Taluka Bhuj',
    pincode: '370001',
    area_type: 'rural',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM041', '240100000012', 'Lakha Rabari', 'head', 55, 'male', { occupation: 'herder', education_level: 'none', is_bpl: true }),
      member('MEM042', '240100000012', 'Jiviben Rabari', 'spouse', 50, 'female', { occupation: 'artisan', education_level: 'none', is_bpl: true }),
      member('MEM043', '240100000012', 'Bhagat Rabari', 'child', 22, 'male', { occupation: 'herder', education_level: 'primary', is_bpl: true, marital_status: 'single' }),
      member('MEM044', '240100000012', 'Santok Rabari', 'child', 17, 'female', { occupation: 'student', education_level: 'secondary', is_bpl: true }),
      member('MEM045', '240100000012', 'Kalu Rabari', 'child', 13, 'male', { occupation: 'student', education_level: 'primary', is_bpl: true }),
    ],
  },

  {
    family_id: '240100000013',
    district: 'Mehsana',
    household_income_annual: 90000,
    income_band: 'bpl',
    caste_category: 'obc',
    land_owned_acres: 2,
    house_type: 'kutcha',
    phone_number: '9876543220',
    address: '34, Station Road, Mehsana',
    pincode: '384001',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM046', '240100000013', 'Govind Thakkar', 'head', 62, 'male', { occupation: 'retired', education_level: 'secondary', is_bpl: true }),
      member('MEM047', '240100000013', 'Saroj Thakkar', 'spouse', 58, 'female', { occupation: 'homemaker', education_level: 'primary', is_bpl: true }),
      member('MEM048', '240100000013', 'Vishal Thakkar', 'child', 28, 'male', { occupation: 'laborer', education_level: 'secondary', is_bpl: true, marital_status: 'married' }),
    ],
  },

  // ── 14: Family with disability ──
  {
    family_id: '240100000014',
    district: 'Anand',
    household_income_annual: 55000,
    income_band: 'bpl',
    caste_category: 'sc',
    land_owned_acres: 0,
    house_type: 'kutcha',
    phone_number: '9876543221',
    address: '89, Vallabh Vidyanagar, Anand',
    pincode: '388120',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM049', '240100000014', 'Prakash Solanki', 'head', 44, 'male', { occupation: 'laborer', education_level: 'primary', is_bpl: true, disability_status: true, disability_percentage: 80 }),
      member('MEM050', '240100000014', 'Manjula Solanki', 'spouse', 40, 'female', { occupation: 'laborer', education_level: 'none', is_bpl: true }),
      member('MEM051', '240100000014', 'Nikita Solanki', 'child', 15, 'female', { occupation: 'student', education_level: 'secondary', is_bpl: true }),
      member('MEM052', '240100000014', 'Harsh Solanki', 'child', 11, 'male', { occupation: 'student', education_level: 'primary', is_bpl: true }),
    ],
  },

  // ── 15: Duplicate Pair 4 — Sharma variant (same phone as family 5) ──
  {
    family_id: '240100000015',
    district: 'Vadodara',
    household_income_annual: 72000,
    income_band: 'bpl',
    caste_category: 'obc',
    land_owned_acres: 0,
    house_type: 'kutcha',
    phone_number: '9876543214', // SAME phone as Family 5!
    address: '23 Waghodia Rd, Vadodara City',
    pincode: '390019',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM053', '240100000015', 'Late Rajesh Kumar Sharma', 'head', 45, 'male', { occupation: 'none', is_alive: false, is_bpl: true }),
      member('MEM054', '240100000015', 'Sunita Devi Sharma', 'spouse', 42, 'female', { occupation: 'tailor', marital_status: 'widowed', education_level: 'secondary', is_bpl: true }),
      member('MEM055', '240100000015', 'Arjun Kumar Sharma', 'child', 16, 'male', { occupation: 'student', education_level: 'secondary', is_bpl: true }),
    ],
  },

  // ── 16-25: More families for diversity ──
  {
    family_id: '240100000016',
    district: 'Surat',
    household_income_annual: 500000,
    income_band: 'mig',
    caste_category: 'general',
    land_owned_acres: 0,
    house_type: 'pucca',
    phone_number: '9876543222',
    address: '55, Ring Road, Adajan',
    pincode: '395009',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM056', '240100000016', 'Nilesh Mehta', 'head', 42, 'male', { occupation: 'diamond_trader', education_level: 'graduate' }),
      member('MEM057', '240100000016', 'Rupal Mehta', 'spouse', 39, 'female', { occupation: 'homemaker', education_level: 'graduate' }),
      member('MEM058', '240100000016', 'Veer Mehta', 'child', 14, 'male', { occupation: 'student', education_level: 'secondary' }),
    ],
  },

  {
    family_id: '240100000017',
    district: 'Junagadh',
    household_income_annual: 75000,
    income_band: 'bpl',
    caste_category: 'obc',
    land_owned_acres: 1,
    house_type: 'kutcha',
    phone_number: '9876543223',
    address: 'Near Girnar Taleti, Junagadh',
    pincode: '362001',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM059', '240100000017', 'Mukesh Koli', 'head', 35, 'male', { occupation: 'fisherman', education_level: 'primary', is_bpl: true }),
      member('MEM060', '240100000017', 'Ramila Koli', 'spouse', 32, 'female', { occupation: 'fish_seller', education_level: 'none', is_bpl: true, is_pregnant: true }),
      member('MEM061', '240100000017', 'Jay Koli', 'child', 7, 'male', { occupation: 'student', education_level: 'primary', is_bpl: true }),
      member('MEM062', '240100000017', 'Jiya Koli', 'child', 4, 'female', { occupation: 'none', education_level: 'none', is_bpl: true }),
    ],
  },

  {
    family_id: '240100000018',
    district: 'Jamnagar',
    household_income_annual: 12000,
    income_band: 'aay',
    caste_category: 'sc',
    land_owned_acres: 0,
    house_type: 'kutcha',
    phone_number: '9876543224',
    address: 'Harijan Vas, Jamnagar',
    pincode: '361001',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM063', '240100000018', 'Mohan Parmar', 'head', 58, 'male', { occupation: 'daily_wage', education_level: 'none', is_bpl: true }),
      member('MEM064', '240100000018', 'Ganga Parmar', 'spouse', 55, 'female', { occupation: 'homemaker', education_level: 'none', is_bpl: true }),
      member('MEM065', '240100000018', 'Sunil Parmar', 'child', 25, 'male', { occupation: 'unemployed', education_level: 'secondary', is_bpl: true, marital_status: 'single' }),
    ],
  },

  {
    family_id: '240100000019',
    district: 'Patan',
    household_income_annual: 95000,
    income_band: 'bpl',
    caste_category: 'obc',
    land_owned_acres: 4,
    house_type: 'kutcha',
    phone_number: '9876543225',
    address: 'Village Siddhpur, Patan',
    pincode: '384151',
    area_type: 'rural',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM066', '240100000019', 'Harish Chaudhary', 'head', 48, 'male', { occupation: 'farmer', education_level: 'primary', is_bpl: true }),
      member('MEM067', '240100000019', 'Lata Chaudhary', 'spouse', 44, 'female', { occupation: 'farmer', education_level: 'none', is_bpl: true }),
      member('MEM068', '240100000019', 'Pooja Chaudhary', 'child', 19, 'female', { occupation: 'student', education_level: 'higher_secondary', is_bpl: true }),
      member('MEM069', '240100000019', 'Ravi Chaudhary', 'child', 15, 'male', { occupation: 'student', education_level: 'secondary', is_bpl: true }),
      member('MEM070', '240100000019', 'Sita Chaudhary', 'child', 10, 'female', { occupation: 'student', education_level: 'primary', is_bpl: true }),
    ],
  },

  // ── 20: Duplicate Pair 5 — Koli variant ──
  {
    family_id: '240100000020',
    district: 'Junagadh',
    household_income_annual: 78000,
    income_band: 'bpl',
    caste_category: 'obc',
    land_owned_acres: 1,
    house_type: 'kutcha',
    phone_number: '9876543223', // SAME phone as Family 17!
    address: 'Nr Girnar Taleti Road, Junagadh City',
    pincode: '362001',
    area_type: 'urban',
    last_updated: new Date().toISOString(),
    members: [
      member('MEM071', '240100000020', 'Mukeshbhai Koli', 'head', 35, 'male', { occupation: 'fisherman', education_level: 'primary', is_bpl: true }),
      member('MEM072', '240100000020', 'Ramilaben Koli', 'spouse', 32, 'female', { occupation: 'fish_seller', education_level: 'none', is_bpl: true }),
    ],
  },

  // ── 21-50: Remaining families to reach 50 ──
  ...generateRemainingFamilies(),
];

function generateRemainingFamilies(): Family[] {
  const families: Family[] = [];
  const surnames = ['Modi', 'Patel', 'Chauhan', 'Rathod', 'Thakor', 'Dabhi', 'Makwana', 'Solanki', 'Gajjar', 'Bhatt',
    'Raval', 'Pandya', 'Oza', 'Vyas', 'Dave', 'Nayak', 'Valand', 'Mistry', 'Darji', 'Vankar',
    'Parikh', 'Barot', 'Jadeja', 'Chudasama', 'Gohil', 'Zala', 'Sarvaiya', 'Rajput', 'Rana', 'Sinh'];
  const maleNames = ['Ajay', 'Vijay', 'Sanjay', 'Kiran', 'Naresh', 'Manish', 'Hitesh', 'Jignesh', 'Paresh', 'Alpesh',
    'Mahesh', 'Ramesh', 'Suresh', 'Kamlesh', 'Dharmesh', 'Nilesh', 'Yogesh', 'Mitesh', 'Chirag', 'Darshan',
    'Harsh', 'Manan', 'Parth', 'Dev', 'Om', 'Yash', 'Raj', 'Aryan', 'Vivaan', 'Aadav'];
  const femaleNames = ['Asha', 'Usha', 'Rekha', 'Geeta', 'Seema', 'Nita', 'Rita', 'Mina', 'Hina', 'Jaya',
    'Anjali', 'Bharti', 'Chhaya', 'Deepa', 'Ela', 'Falguni', 'Gauri', 'Heena', 'Ila', 'Jasmin',
    'Komal', 'Leela', 'Mamta', 'Nandini', 'Pallavi', 'Radha', 'Sonal', 'Tara', 'Uma', 'Varsha'];

  const categories: Array<'general' | 'obc' | 'sc' | 'st'> = ['general', 'obc', 'sc', 'st'];
  const incomes = [10000, 40000, 65000, 85000, 120000, 180000, 250000, 350000, 500000, 800000];

  for (let i = 21; i <= 50; i++) {
    const familyId = `2401000000${String(i).padStart(2, '0')}`;
    const surname = surnames[(i - 21) % surnames.length];
    const district = DISTRICTS[(i - 21) % DISTRICTS.length];
    const income = incomes[(i - 21) % incomes.length];
    const caste = categories[(i - 21) % categories.length];
    const isBpl = income <= 100000;
    const headAge = 30 + ((i * 7) % 35);
    const spouseAge = headAge - 2 - (i % 5);

    const incomeBand = income <= 15000 ? 'aay' as const
      : income <= 100000 ? 'bpl' as const
      : income <= 300000 ? 'lig' as const
      : income <= 600000 ? 'mig' as const
      : 'hig' as const;

    const memberList: FamilyMember[] = [
      member(`MEM${String(i * 4).padStart(3, '0')}`, familyId,
        `${maleNames[(i - 21) % maleNames.length]} ${surname}`, 'head', headAge, 'male',
        { occupation: i % 3 === 0 ? 'farmer' : i % 3 === 1 ? 'laborer' : 'business',
          education_level: i % 4 === 0 ? 'none' : i % 4 === 1 ? 'primary' : i % 4 === 2 ? 'secondary' : 'graduate',
          is_bpl: isBpl }),
      member(`MEM${String(i * 4 + 1).padStart(3, '0')}`, familyId,
        `${femaleNames[(i - 21) % femaleNames.length]} ${surname}`, 'spouse', spouseAge, 'female',
        { occupation: 'homemaker',
          education_level: i % 3 === 0 ? 'none' : i % 3 === 1 ? 'primary' : 'secondary',
          is_bpl: isBpl }),
    ];

    // Add 1-3 children
    const numChildren = 1 + (i % 3);
    for (let c = 0; c < numChildren; c++) {
      const childAge = Math.max(2, headAge - 25 + c * 3);
      const childGender = (i + c) % 2 === 0 ? 'female' as const : 'male' as const;
      const childNames = childGender === 'male' ? maleNames : femaleNames;
      memberList.push(
        member(`MEM${String(i * 4 + 2 + c).padStart(3, '0')}`, familyId,
          `${childNames[(i + c + 10) % childNames.length]} ${surname}`, 'child', childAge, childGender,
          { occupation: childAge < 6 ? 'none' : 'student',
            education_level: childAge < 6 ? 'none' : childAge < 12 ? 'primary' : childAge < 16 ? 'secondary' : 'higher_secondary',
            is_bpl: isBpl })
      );
    }

    families.push({
      family_id: familyId,
      district,
      household_income_annual: income,
      income_band: incomeBand,
      caste_category: caste,
      land_owned_acres: i % 5 === 0 ? 0 : (i % 7) + 1,
      house_type: income > 200000 ? 'pucca' : 'kutcha',
      phone_number: `98765${String(43230 + i - 21).padStart(5, '0')}`,
      address: `${i * 3}, ${district} Main Road`,
      pincode: `${360000 + (i * 100)}`,
      area_type: i % 3 === 0 ? 'rural' : 'urban',
      last_updated: new Date().toISOString(),
      members: memberList,
    });
  }

  return families;
}

// ============================================================
// In-memory data store (used by API routes)
// ============================================================

// Mutable copy of families for simulation
let familiesStore = [...syntheticFamilies.map(f => JSON.parse(JSON.stringify(f)) as Family)];

// Background hydration from Supabase PostgreSQL
if (typeof window === 'undefined') {
  fetchFamiliesFromSupabase().then(dbFamilies => {
    if (dbFamilies && dbFamilies.length > 0) {
      familiesStore = dbFamilies;
    }
  }).catch(() => {
    // Non-blocking fallback to synthetic baseline
  });
}

// Life event log
let eventLog: LifeEventLogEntry[] = [];

// Duplicate pairs (computed on first scan)
let duplicatePairsStore: DuplicatePair[] | null = null;

// ---------- Data Access Functions ----------

export function getAllFamilies(): Family[] {
  return familiesStore;
}

export function addFamily(newFamily: Family): void {
  const existingIdx = familiesStore.findIndex(f => f.family_id === newFamily.family_id);
  if (existingIdx !== -1) {
    familiesStore[existingIdx] = newFamily;
  } else {
    familiesStore.push(newFamily);
  }
  if (typeof window === 'undefined') {
    upsertFamilyToSupabase(newFamily).catch(() => {});
  }
}

export function getFamilyById(familyId: string): Family | undefined {
  return familiesStore.find(f => f.family_id === familyId);
}

export function updateFamily(familyId: string, updatedFamily: Family): void {
  const idx = familiesStore.findIndex(f => f.family_id === familyId);
  if (idx !== -1) {
    familiesStore[idx] = updatedFamily;
  }
  // Write-through to Supabase
  if (typeof window === 'undefined') {
    upsertFamilyToSupabase(updatedFamily).catch(() => {});
  }
}

export function addEventLogEntry(entry: LifeEventLogEntry): void {
  eventLog.push(entry);
  // Write-through to Supabase
  if (typeof window === 'undefined') {
    logEventToSupabase(entry).catch(() => {});
  }
}

export function getEventLog(familyId?: string): LifeEventLogEntry[] {
  if (familyId) {
    return eventLog.filter(e => e.family_id === familyId);
  }
  return eventLog;
}

export async function persistFamilyUpdate(updatedFamily: Family, logEntry?: LifeEventLogEntry): Promise<void> {
  const idx = familiesStore.findIndex(f => f.family_id === updatedFamily.family_id);
  if (idx !== -1) {
    familiesStore[idx] = updatedFamily;
  }
  if (logEntry) {
    eventLog.push(logEntry);
  }
  if (typeof window === 'undefined') {
    await upsertFamilyToSupabase(updatedFamily);
    if (logEntry) {
      await logEventToSupabase(logEntry);
    }
  }
}

export async function resetFamily(familyId: string): Promise<Family | null> {
  const original = syntheticFamilies.find(f => f.family_id === familyId);
  if (!original) return null;
  const idx = familiesStore.findIndex(f => f.family_id === familyId);
  const cloned = JSON.parse(JSON.stringify(original)) as Family;
  if (idx !== -1) {
    familiesStore[idx] = cloned;
  } else {
    familiesStore.push(cloned);
  }
  // Clear event logs for this family
  eventLog = eventLog.filter(e => e.family_id !== familyId);
  // Write-through to Supabase
  if (typeof window === 'undefined') {
    try {
      await upsertFamilyToSupabase(cloned);
      const { clearEventLogsForFamilyInSupabase } = await import('./supabase/db');
      await clearEventLogsForFamilyInSupabase(familyId);
    } catch (err) {
      console.error('Error resetting family in Supabase:', err);
    }
  }
  return cloned;
}

// Store for reviewed statuses, keyed by both pair ID and compound family key: minId__maxId
const duplicateReviews = new Map<string, {
  status: DuplicateStatus;
  reviewed_at?: string;
}>();

function getPairCompoundKey(familyAId: string, familyBId: string): string {
  return [familyAId, familyBId].sort().join('__');
}

// Initial baseline reviewed duplicate pairs
duplicateReviews.set('DUP-0004', { status: 'confirmed', reviewed_at: '2026-03-15T10:30:00Z' });
duplicateReviews.set(getPairCompoundKey('240100000005', '240100000015'), { status: 'confirmed', reviewed_at: '2026-03-15T10:30:00Z' });
duplicateReviews.set('DUP-0002', { status: 'false_positive', reviewed_at: '2026-03-14T14:15:00Z' });
duplicateReviews.set(getPairCompoundKey('240100000003', '240100000008'), { status: 'false_positive', reviewed_at: '2026-03-14T14:15:00Z' });

function applyReviewedStatuses(pairs: DuplicatePair[]): DuplicatePair[] {
  for (const pair of pairs) {
    const compoundKey = getPairCompoundKey(pair.family_a_id, pair.family_b_id);
    const review = duplicateReviews.get(pair.id) || duplicateReviews.get(compoundKey);
    if (review) {
      pair.status = review.status;
      pair.reviewed_at = review.reviewed_at;
    }
  }
  return pairs;
}

let hasLoadedSupabaseStatuses = false;

export async function syncDuplicateStatusesFromSupabase(): Promise<void> {
  if (typeof window !== 'undefined') return;
  try {
    const { getPool } = await import('./supabase/db');
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, family_a_id, family_b_id, status, reviewed_at 
       FROM public.duplicate_pairs 
       WHERE status != 'pending' OR reviewed_at IS NOT NULL`
    );
    for (const row of res.rows) {
      const review = {
        status: row.status as DuplicateStatus,
        reviewed_at: row.reviewed_at
          ? (row.reviewed_at instanceof Date ? row.reviewed_at.toISOString() : String(row.reviewed_at))
          : new Date().toISOString(),
      };
      if (row.id) duplicateReviews.set(row.id, review);
      if (row.family_a_id && row.family_b_id) {
        duplicateReviews.set(getPairCompoundKey(row.family_a_id, row.family_b_id), review);
      }
    }
  } catch (err) {
    console.warn('Non-fatal: Could not pre-load duplicate statuses from Supabase:', err);
  }
}

export function getDuplicatePairs(weights?: DuplicateWeights): DuplicatePair[] {
  if (!hasLoadedSupabaseStatuses && typeof window === 'undefined') {
    hasLoadedSupabaseStatuses = true;
    syncDuplicateStatusesFromSupabase().catch(() => {});
  }

  if (weights) {
    duplicatePairsStore = scanForDuplicates(familiesStore, weights);
  } else if (!duplicatePairsStore) {
    duplicatePairsStore = scanForDuplicates(familiesStore, DEFAULT_WEIGHTS);
  }
  return applyReviewedStatuses(duplicatePairsStore);
}

export function rescanDuplicates(weights = DEFAULT_WEIGHTS): DuplicatePair[] {
  duplicatePairsStore = scanForDuplicates(familiesStore, weights);
  return applyReviewedStatuses(duplicatePairsStore);
}

export function updateDuplicateStatus(
  pairId: string,
  status: DuplicateStatus
): DuplicatePair | undefined {
  const pairs = getDuplicatePairs();
  const pair = pairs.find(p => p.id === pairId);
  const reviewed_at = status === 'pending' ? undefined : new Date().toISOString();

  duplicateReviews.set(pairId, { status, reviewed_at });
  if (pair) {
    pair.status = status;
    pair.reviewed_at = reviewed_at;
    const compoundKey = getPairCompoundKey(pair.family_a_id, pair.family_b_id);
    duplicateReviews.set(compoundKey, { status, reviewed_at });
  }

  // Write-through to Supabase
  if (typeof window === 'undefined') {
    updateDuplicateStatusInSupabase(
      pairId,
      status,
      pair?.family_a_id,
      pair?.family_b_id
    ).catch((err) => {
      console.warn('Non-fatal: could not update duplicate status in Supabase:', err);
    });
  }

  return pair;
}

export function getDashboardStats() {
  const families = getAllFamilies();
  const allMembers = families.flatMap(f => f.members);
  const districts = new Set(families.map(f => f.district));
  let totalEligible = 0;
  families.forEach(f => {
    totalEligible += getUniqueEligibleSchemeIds(f).length;
  });

  return {
    total_families: families.length,
    total_members: allMembers.length,
    total_schemes_tracked: 20,
    total_eligible_benefits: totalEligible,
    flagged_duplicates: getDuplicatePairs().filter(p => p.status === 'pending').length,
    districts_covered: districts.size,
  };
}

export function resetData(): void {
  familiesStore = [...syntheticFamilies.map(f => JSON.parse(JSON.stringify(f)) as Family)];
  eventLog = [];
  duplicatePairsStore = null;
  duplicateReviews.clear();
  duplicateReviews.set('DUP-0004', { status: 'confirmed', reviewed_at: '2026-03-15T10:30:00Z' });
  duplicateReviews.set(getPairCompoundKey('240100000005', '240100000015'), { status: 'confirmed', reviewed_at: '2026-03-15T10:30:00Z' });
  duplicateReviews.set('DUP-0002', { status: 'false_positive', reviewed_at: '2026-03-14T14:15:00Z' });
  duplicateReviews.set(getPairCompoundKey('240100000003', '240100000008'), { status: 'false_positive', reviewed_at: '2026-03-14T14:15:00Z' });
}
