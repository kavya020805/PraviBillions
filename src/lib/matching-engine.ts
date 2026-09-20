// ============================================================
// Family ID Copilot — Duplicate Matching Engine
// ============================================================

import { distance } from 'fastest-levenshtein';
import * as stringSimilarity from 'string-similarity';
import type { Family, DuplicatePair, DuplicateWeights, FieldComparison, DuplicateSignalScores } from './types';

// ---------- Default Weights ----------

export const DEFAULT_WEIGHTS: DuplicateWeights = {
  name_weight: 20,
  address_weight: 10,
  dob_weight: 30,
  phone_weight: 40,
  threshold: 50,
};

// ---------- Normalization Helpers ----------

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\b(street|st|road|rd|lane|ln|nagar|society|soc|flat|no|number)\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------- Signal Scoring Functions ----------

/**
 * Compare head-of-household and spouse names.
 * Uses Jaro-Winkler similarity (via string-similarity's Dice coefficient as proxy).
 */
function computeNameScore(familyA: Family, familyB: Family, maxWeight: number): number {
  const headA = familyA.members.find(m => m.relation_to_head === 'head');
  const headB = familyB.members.find(m => m.relation_to_head === 'head');

  if (!headA || !headB) return 0;

  const nameA = normalizeName(headA.name);
  const nameB = normalizeName(headB.name);

  // Dice coefficient similarity
  const headSimilarity = stringSimilarity.compareTwoStrings(nameA, nameB);

  // Also check spouse names if they exist
  const spouseA = familyA.members.find(m => m.relation_to_head === 'spouse');
  const spouseB = familyB.members.find(m => m.relation_to_head === 'spouse');

  let spouseSimilarity = 0;
  if (spouseA && spouseB) {
    spouseSimilarity = stringSimilarity.compareTwoStrings(
      normalizeName(spouseA.name),
      normalizeName(spouseB.name)
    );
  }

  // Weighted average: head name matters more
  const avgSimilarity = spouseA && spouseB
    ? headSimilarity * 0.6 + spouseSimilarity * 0.4
    : headSimilarity;

  // Also check Levenshtein distance for short names
  const levenshteinDist = distance(nameA, nameB);
  const maxLen = Math.max(nameA.length, nameB.length) || 1;
  const levenshteinSimilarity = 1 - (levenshteinDist / maxLen);

  // Use the higher of the two similarity measures
  const finalSimilarity = Math.max(avgSimilarity, levenshteinSimilarity);

  // Threshold: only score if similarity is above 0.7
  if (finalSimilarity < 0.7) return 0;

  return Math.round(finalSimilarity * maxWeight);
}

/**
 * Compare addresses after normalization.
 */
function computeAddressScore(familyA: Family, familyB: Family, maxWeight: number): number {
  const addrA = normalizeAddress(familyA.address);
  const addrB = normalizeAddress(familyB.address);

  if (!addrA || !addrB) return 0;

  // Check pincode first — same pincode is a prerequisite
  if (familyA.pincode !== familyB.pincode) return 0;

  const similarity = stringSimilarity.compareTwoStrings(addrA, addrB);

  if (similarity < 0.5) return 0;

  return Math.round(similarity * maxWeight);
}

/**
 * Compare dates of birth of heads.
 */
function computeDobScore(familyA: Family, familyB: Family, maxWeight: number): number {
  const headA = familyA.members.find(m => m.relation_to_head === 'head');
  const headB = familyB.members.find(m => m.relation_to_head === 'head');

  if (!headA || !headB) return 0;

  const dobA = new Date(headA.dob);
  const dobB = new Date(headB.dob);

  const diffDays = Math.abs(dobA.getTime() - dobB.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return maxWeight; // Exact match
  if (diffDays <= 30) return Math.round(maxWeight * 0.7); // Within a month (typo distance)
  if (diffDays <= 365) return Math.round(maxWeight * 0.5); // Within a year
  return 0;
}

/**
 * Compare phone numbers — exact match is the strongest signal.
 */
function computePhoneScore(familyA: Family, familyB: Family, maxWeight: number): number {
  if (!familyA.phone_number || !familyB.phone_number) return 0;

  const phoneA = familyA.phone_number.replace(/\D/g, '');
  const phoneB = familyB.phone_number.replace(/\D/g, '');

  if (phoneA === phoneB) return maxWeight;

  // Check if last 10 digits match (different country code prefix)
  if (phoneA.slice(-10) === phoneB.slice(-10)) return maxWeight;

  return 0;
}

// ---------- Field Comparison Generator ----------

function generateFieldComparison(familyA: Family, familyB: Family): FieldComparison[] {
  const comparisons: FieldComparison[] = [];
  const headA = familyA.members.find(m => m.relation_to_head === 'head');
  const headB = familyB.members.find(m => m.relation_to_head === 'head');

  // Head name
  if (headA && headB) {
    const sim = stringSimilarity.compareTwoStrings(normalizeName(headA.name), normalizeName(headB.name));
    comparisons.push({
      field_name: 'Head of Household',
      value_a: headA.name,
      value_b: headB.name,
      match_level: sim === 1 ? 'exact' : sim > 0.7 ? 'near' : 'different',
      similarity: Math.round(sim * 100),
    });
  }

  // Spouse name
  const spouseA = familyA.members.find(m => m.relation_to_head === 'spouse');
  const spouseB = familyB.members.find(m => m.relation_to_head === 'spouse');
  if (spouseA && spouseB) {
    const sim = stringSimilarity.compareTwoStrings(normalizeName(spouseA.name), normalizeName(spouseB.name));
    comparisons.push({
      field_name: 'Spouse Name',
      value_a: spouseA.name,
      value_b: spouseB.name,
      match_level: sim === 1 ? 'exact' : sim > 0.7 ? 'near' : 'different',
      similarity: Math.round(sim * 100),
    });
  }

  // Address
  const addrSim = stringSimilarity.compareTwoStrings(normalizeAddress(familyA.address), normalizeAddress(familyB.address));
  comparisons.push({
    field_name: 'Address',
    value_a: familyA.address,
    value_b: familyB.address,
    match_level: addrSim === 1 ? 'exact' : addrSim > 0.5 ? 'near' : 'different',
    similarity: Math.round(addrSim * 100),
  });

  // Pincode
  comparisons.push({
    field_name: 'Pincode',
    value_a: familyA.pincode,
    value_b: familyB.pincode,
    match_level: familyA.pincode === familyB.pincode ? 'exact' : 'different',
  });

  // Phone
  comparisons.push({
    field_name: 'Phone Number',
    value_a: familyA.phone_number,
    value_b: familyB.phone_number,
    match_level: familyA.phone_number === familyB.phone_number ? 'exact' : 'different',
  });

  // DOB of head
  if (headA && headB) {
    const dobMatch = headA.dob === headB.dob;
    comparisons.push({
      field_name: 'Head DOB',
      value_a: headA.dob,
      value_b: headB.dob,
      match_level: dobMatch ? 'exact' : 'different',
    });
  }

  // District
  comparisons.push({
    field_name: 'District',
    value_a: familyA.district,
    value_b: familyB.district,
    match_level: familyA.district === familyB.district ? 'exact' : 'different',
  });

  // Member count
  comparisons.push({
    field_name: 'Member Count',
    value_a: String(familyA.members.length),
    value_b: String(familyB.members.length),
    match_level: familyA.members.length === familyB.members.length ? 'exact' : 'different',
  });

  return comparisons;
}

// ---------- Main Scan Function ----------

/**
 * Scan all families for duplicate pairs.
 * Returns pairs sorted by confidence score descending.
 */
export function scanForDuplicates(
  families: Family[],
  weights: DuplicateWeights = DEFAULT_WEIGHTS
): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];
  let pairId = 1;

  for (let i = 0; i < families.length; i++) {
    for (let j = i + 1; j < families.length; j++) {
      const familyA = families[i];
      const familyB = families[j];

      const signals: DuplicateSignalScores = {
        name_score: computeNameScore(familyA, familyB, weights.name_weight),
        address_score: computeAddressScore(familyA, familyB, weights.address_weight),
        dob_score: computeDobScore(familyA, familyB, weights.dob_weight),
        phone_score: computePhoneScore(familyA, familyB, weights.phone_weight),
      };

      const confidenceScore =
        signals.name_score + signals.address_score + signals.dob_score + signals.phone_score;

      if (confidenceScore >= weights.threshold) {
        const headA = familyA.members.find(m => m.relation_to_head === 'head');
        const headB = familyB.members.find(m => m.relation_to_head === 'head');

        pairs.push({
          id: `DUP-${String(pairId++).padStart(4, '0')}`,
          family_a_id: familyA.family_id,
          family_b_id: familyB.family_id,
          family_a_head_name: headA?.name || 'Unknown',
          family_b_head_name: headB?.name || 'Unknown',
          confidence_score: Math.min(100, confidenceScore),
          signals,
          status: 'pending',
          field_comparison: generateFieldComparison(familyA, familyB),
        });
      }
    }
  }

  // Sort by confidence score descending
  return pairs.sort((a, b) => b.confidence_score - a.confidence_score);
}
