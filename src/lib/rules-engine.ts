// ============================================================
// Family ID Copilot — Rules Engine
// Shared by Simulator and Civic Assistant
// ============================================================

import type { Family, FamilyMember, EligibilityResult, EligibilityDiff, SchemeRule } from './types';
import { schemeRules } from './schemes';

/**
 * Evaluate all 20 scheme rules against a family.
 * Returns an array of EligibilityResult for every scheme × relevant member combination.
 */
export function evaluateEligibility(family: Family): EligibilityResult[] {
  const results: EligibilityResult[] = [];

  for (const scheme of schemeRules) {
    if (scheme.scope === 'family') {
      // Family-level scheme — evaluate once
      const eligible = scheme.eligibility_predicate(family);
      results.push({
        scheme_id: scheme.id,
        scheme_name: scheme.name,
        eligible,
      });
    } else {
      // Member-level scheme — evaluate for each alive member
      for (const member of family.members) {
        if (!member.is_alive) continue;
        const eligible = scheme.eligibility_predicate(family, member);
        if (eligible) {
          results.push({
            scheme_id: scheme.id,
            scheme_name: scheme.name,
            eligible: true,
            member_id: member.member_id,
            member_name: member.name,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Get only the eligible schemes (de-duplicated by scheme_id).
 * For member-scoped schemes, returns each member eligibility separately.
 */
export function getEligibleSchemes(family: Family): EligibilityResult[] {
  return evaluateEligibility(family).filter(r => r.eligible);
}

/**
 * Get unique eligible scheme IDs for a family.
 */
export function getUniqueEligibleSchemeIds(family: Family): string[] {
  const eligible = getEligibleSchemes(family);
  return [...new Set(eligible.map(r => r.scheme_id))];
}

/**
 * Diff two eligibility snapshots to find gained, lost, and unchanged schemes.
 */
export function diffEligibility(
  before: EligibilityResult[],
  after: EligibilityResult[]
): EligibilityDiff {
  const beforeEligible = new Set(
    before.filter(r => r.eligible).map(r => `${r.scheme_id}::${r.member_id || 'family'}`)
  );
  const afterEligible = new Set(
    after.filter(r => r.eligible).map(r => `${r.scheme_id}::${r.member_id || 'family'}`)
  );

  const gained: EligibilityDiff['gained'] = [];
  const lost: EligibilityDiff['lost'] = [];
  const unchanged: EligibilityDiff['unchanged'] = [];

  // Find gained (in after but not in before)
  for (const result of after.filter(r => r.eligible)) {
    const key = `${result.scheme_id}::${result.member_id || 'family'}`;
    const scheme = schemeRules.find(s => s.id === result.scheme_id)!;
    if (!beforeEligible.has(key)) {
      gained.push({ ...result, scheme });
    } else {
      unchanged.push({ ...result, scheme });
    }
  }

  // Find lost (in before but not in after)
  for (const result of before.filter(r => r.eligible)) {
    const key = `${result.scheme_id}::${result.member_id || 'family'}`;
    const scheme = schemeRules.find(s => s.id === result.scheme_id)!;
    if (!afterEligible.has(key)) {
      lost.push({ ...result, scheme });
    }
  }

  return { gained, lost, unchanged };
}

/**
 * Get schemes that might change based on a specific event type.
 * Optimization: only re-evaluate relevant schemes.
 */
export function getTriggeredSchemes(eventType: string): SchemeRule[] {
  const fieldMap: Record<string, string[]> = {
    member_turns_18: ['dob'],
    member_turns_60: ['dob'],
    marital_status_widowed: ['marital_status'],
    new_child_born: ['gender', 'dob'],
    disability_recorded: ['disability_status'],
    income_decreased: ['household_income_annual', 'income_band', 'is_bpl'],
    income_increased: ['household_income_annual', 'income_band', 'is_bpl'],
    breadwinner_death: ['is_alive', 'is_bpl'],
    child_starts_school: ['education_level', 'dob'],
    child_starts_college: ['education_level', 'dob'],
    pregnancy_recorded: ['is_pregnant'],
  };

  const relevantFields = fieldMap[eventType] || [];

  return schemeRules.filter(scheme =>
    scheme.triggering_fields.some(field => relevantFields.includes(field))
  );
}
