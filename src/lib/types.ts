// ============================================================
// Family ID Copilot — Core Type Definitions
// ============================================================

// ---------- Enums ----------

export type RelationToHead = 'head' | 'spouse' | 'child' | 'parent' | 'other';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'widowed' | 'divorced';
export type EducationLevel = 'none' | 'primary' | 'secondary' | 'higher_secondary' | 'graduate' | 'post_graduate';
export type IncomeBand = 'aay' | 'bpl' | 'lig' | 'mig' | 'hig';
export type CasteCategory = 'general' | 'obc' | 'sc' | 'st';
export type HouseType = 'kutcha' | 'pucca';
export type SchemeCategory = 'pension' | 'scholarship' | 'housing' | 'health' | 'employment' | 'social' | 'food';
export type SchemeScope = 'family' | 'member';
export type DuplicateStatus = 'pending' | 'confirmed' | 'false_positive';
export type Language = 'en' | 'hi' | 'gu';

// ---------- Family Member ----------

export interface FamilyMember {
  member_id: string;
  family_id: string;
  name: string;
  relation_to_head: RelationToHead;
  dob: string; // ISO date string
  gender: Gender;
  marital_status: MaritalStatus;
  occupation: string;
  disability_status: boolean;
  disability_percentage?: number;
  education_level: EducationLevel;
  is_bpl: boolean;
  is_alive: boolean;
  is_pregnant?: boolean;
}

// ---------- Family ----------

export interface Family {
  family_id: string;       // 12-digit
  district: string;
  members: FamilyMember[];
  household_income_annual: number;
  income_band: IncomeBand;
  caste_category: CasteCategory;
  land_owned_acres: number;
  house_type: HouseType;
  phone_number: string;
  address: string;
  pincode: string;
  last_updated: string;   // ISO timestamp
  area_type: 'rural' | 'urban';
  created_by?: string;
}

// ---------- Scheme Rule (Declarative) ----------

export interface SchemeRule {
  id: string;
  name: string;
  name_hi: string;
  name_gu: string;
  description: string;
  description_hi: string;
  description_gu: string;
  benefit: string;
  benefit_hi: string;
  benefit_gu: string;
  category: SchemeCategory;
  triggering_fields: string[];
  scope: SchemeScope;
  next_steps: string;
  next_steps_hi: string;
  next_steps_gu: string;
  // The predicate is a function — schemes.ts exports these as part of each rule
  eligibility_predicate: (family: Family, member?: FamilyMember) => boolean;
}

// ---------- Eligibility Result ----------

export interface EligibilityResult {
  scheme_id: string;
  scheme_name: string;
  eligible: boolean;
  member_id?: string;     // For member-scoped schemes
  member_name?: string;
}

export interface EligibilitySnapshot {
  family_id: string;
  timestamp: string;
  results: EligibilityResult[];
  triggered_by_event?: string;
}

export interface EligibilityDiff {
  gained: (EligibilityResult & { scheme: SchemeRule })[];
  lost: (EligibilityResult & { scheme: SchemeRule })[];
  unchanged: (EligibilityResult & { scheme: SchemeRule })[];
}

// ---------- Life Event ----------

export type LifeEventType =
  | 'member_turns_18'
  | 'member_turns_60'
  | 'marital_status_widowed'
  | 'new_child_born'
  | 'disability_recorded'
  | 'income_decreased'
  | 'income_increased'
  | 'breadwinner_death'
  | 'child_starts_school'
  | 'child_starts_college'
  | 'pregnancy_recorded';

export interface LifeEvent {
  type: LifeEventType;
  label: string;
  label_hi: string;
  label_gu: string;
  description: string;
  requires_member_selection: boolean;
  icon: string; // Lucide icon name
  apply: (family: Family, params?: LifeEventParams) => Family;
}

export interface LifeEventParams {
  member_id?: string;
  new_income?: number;
  child_gender?: Gender;
  child_name?: string;
}

export interface LifeEventLogEntry {
  id: string;
  family_id: string;
  event_type: LifeEventType;
  event_label: string;
  event_details: string;
  eligibility_changes: {
    gained: string[];
    lost: string[];
  };
  applied_at: string;
}

// ---------- Duplicate Detection ----------

export interface DuplicateSignalScores {
  name_score: number;       // 0-20
  address_score: number;    // 0-10
  dob_score: number;        // 0-30
  phone_score: number;      // 0-40
}

export interface DuplicatePair {
  id: string;
  family_a_id: string;
  family_b_id: string;
  family_a_head_name: string;
  family_b_head_name: string;
  confidence_score: number; // 0-100
  signals: DuplicateSignalScores;
  status: DuplicateStatus;
  flagged_at?: string;
  reviewed_at?: string;
  field_comparison: FieldComparison[];
}

export interface FieldComparison {
  field_name: string;
  value_a: string;
  value_b: string;
  match_level: 'exact' | 'near' | 'different';
  similarity?: number;
}

// ---------- Duplicate Detection Weights (configurable) ----------

export interface DuplicateWeights {
  name_weight: number;     // default 20
  address_weight: number;  // default 10
  dob_weight: number;      // default 30
  phone_weight: number;    // default 40
  threshold: number;       // default 50
}

// ---------- Civic Assistant & Welfare Copilot ----------

export interface AssistantQuestion {
  id: string;
  step: number;
  question: string;
  question_hi: string;
  question_gu: string;
  input_type: 'number' | 'radio' | 'select' | 'toggle' | 'member_form';
  options?: AssistantOption[];
  maps_to: string; // which Family field(s) this maps to
}

export interface AssistantOption {
  value: string;
  label: string;
  label_hi: string;
  label_gu: string;
}

export interface AssistantAnswer {
  question_id: string;
  value: string | number | boolean | MemberInput[];
}

export interface MemberInput {
  age: number;
  gender: Gender;
  relation_to_head: RelationToHead;
  marital_status: MaritalStatus;
  disability_status: boolean;
  education_level: EducationLevel;
}

// ---------- Dashboard Stats ----------

export interface DashboardStats {
  total_families: number;
  total_members: number;
  total_schemes_tracked: number;
  total_eligible_benefits: number;
  flagged_duplicates: number;
  districts_covered: number;
}
