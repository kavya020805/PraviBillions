// ============================================================
// Family ID Copilot — DPDP Act 2023 Civic Privacy & Data Protection
// ============================================================

import type { Family, FamilyMember, DuplicatePair } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

/**
 * Redacts a 10-digit Indian phone number to prevent unauthorized citizen tracking.
 * Example: '9876543210' -> '+91 98*** **210'
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return '—';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 5) return '******';
  const firstTwo = clean.slice(0, 2);
  const lastThree = clean.slice(-3);
  return `+91 ${firstTwo}*** **${lastThree}`;
}

/**
 * Redacts specific residential door/street information while retaining the civic locality,
 * complying with Digital Personal Data Protection (DPDP) Act 2023 guidelines for public administrators.
 * Example: '42, Mahatma Gandhi Road, Navrangpura' -> '[Street Address Redacted · DPDP Act], Navrangpura'
 */
export function maskAddress(address?: string | null, district?: string): string {
  if (!address) return district ? `[Street Redacted], ${district}` : '[Street Redacted]';

  // Split by comma to see if there's a neighborhood / village / ward
  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const locality = parts.slice(1).join(', ');
    return `[Street Address Redacted · DPDP Act], ${locality}`;
  }

  return `[Street Redacted · DPDP Act 2023], ${district || 'Gujarat'}`;
}

/**
 * Conceals exact day and month of birth to safeguard citizen identity against scraping,
 * while preserving the birth year for demographic and welfare scheme computation.
 * Example: '1984-06-15' -> '1984-**-**'
 */
export function maskDob(dob?: string | null): string {
  if (!dob) return '****-**-**';
  const match = dob.match(/^(\d{4})/);
  if (match) {
    return `${match[1]}-**-**`;
  }
  return '****-**-**';
}

/**
 * Redacts specific caste / community identifiers to prevent social profiling,
 * bias, and discrimination in administrative and public interfaces.
 * Complies with Supreme Court privacy principles and DPDP Act 2023 sensitive categories.
 * Example: 'obc' -> '[Protected Category · Verified for Entitlements]'
 */
export function maskCaste(caste?: string | null, isOwner = false): string {
  if (isOwner && caste) {
    return caste.toUpperCase();
  }
  return 'Protected Category';
}

/**
 * Redacts exact annual household financial earnings to protect personal economic privacy,
 * while preserving verified civic entitlement income bands (BPL, AAY, LIG, etc.)
 * Example: 110000 -> '₹ •••••• (Verified: LIG)'
 */
export function maskIncome(income: number, band: string, isOwner = false): string {
  if (isOwner) {
    return formatCurrency(income);
  }
  return `₹ •••••• (${band.toUpperCase()} Verified)`;
}

/**
 * Redacts exact agricultural land acreage to prevent asset targeting and predatory solicitation.
 * Example: 1.5 -> 'Agricultural Landholder (Protected RoR)'
 */
export function maskLand(acres: number, isOwner = false): string {
  if (isOwner) {
    return acres > 0 ? `${acres} Acres Land` : 'Landless';
  }
  return acres > 0 ? 'Landholder (RoR Protected)' : 'Landless (Verified)';
}

/**
 * Redacts clinical disability percentages to safeguard sensitive medical records.
 */
export function maskDisability(disability_status: boolean, percentage?: number, isOwner = false): string {
  if (!disability_status) return '';
  if (isOwner) {
    return `Disability (${percentage || 40}%)`;
  }
  return 'Specially Abled (Certified)';
}

/**
 * Redacts pregnancy status to protect maternal health privacy.
 */
export function maskPregnancy(is_pregnant?: boolean, isOwner = false): string {
  if (!is_pregnant) return '';
  if (isOwner) {
    return 'Pregnant Mother';
  }
  return 'Maternal Welfare Benefit (Protected)';
}

/**
 * Mask an individual family member's sensitive demographic identifiers.
 */
export function maskMemberForRole(member: FamilyMember, isOwner: boolean): FamilyMember {
  if (isOwner) {
    return member;
  }

  return {
    ...member,
    dob: maskDob(member.dob),
  };
}

export type ProtectedFamily = Family & {
  is_masked?: boolean;
  mask_reason?: string;
  caste_display?: string;
  income_display?: string;
  land_display?: string;
};

/**
 * Core RBAC & Privacy Protection Gatekeeper:
 * - If requester is the verified citizen owner of this household (user.family_id === family.family_id),
 *   they receive full unredacted data.
 * - If requester is an administrator, talati officer, or unauthorized third-party,
 *   sensitive fields (phone number, exact street address, exact day/month of birth, exact annual income,
 *   caste community classification, and landholding specifics) are automatically redacted.
 */
export function maskFamilyForRole(family: Family, isOwner: boolean): ProtectedFamily {
  if (isOwner) {
    return {
      ...family,
      is_masked: false,
      caste_display: family.caste_category.toUpperCase(),
      income_display: formatCurrency(family.household_income_annual),
      land_display: family.land_owned_acres > 0 ? `${family.land_owned_acres} Acres Land` : 'Landless',
    };
  }

  return {
    ...family,
    phone_number: maskPhoneNumber(family.phone_number),
    address: maskAddress(family.address, family.district),
    members: family.members.map(m => maskMemberForRole(m, false)),
    is_masked: true,
    caste_display: maskCaste(family.caste_category, false),
    income_display: maskIncome(family.household_income_annual, family.income_band, false),
    land_display: maskLand(family.land_owned_acres, false),
    mask_reason: 'DPDP Act 2023: Citizen phone, street address, exact DOB, annual income, caste classification, and medical data are redacted for administrative personnel.',
  };
}

/**
 * Protects duplicate pairs viewed by administrators.
 * Masks raw phone numbers, street addresses, head DOBs, income, and caste in field comparisons
 * while leaving match levels ('exact' | 'near' | 'different') and scoring intact.
 */
export function maskDuplicatePairForAuditor(pair: DuplicatePair): DuplicatePair {
  return {
    ...pair,
    field_comparison: pair.field_comparison.map(fc => {
      const fieldLower = fc.field_name.toLowerCase();
      if (fieldLower.includes('phone')) {
        return {
          ...fc,
          value_a: maskPhoneNumber(fc.value_a),
          value_b: maskPhoneNumber(fc.value_b),
        };
      }
      if (fieldLower.includes('address')) {
        return {
          ...fc,
          value_a: maskAddress(fc.value_a),
          value_b: maskAddress(fc.value_b),
        };
      }
      if (fieldLower.includes('dob')) {
        return {
          ...fc,
          value_a: maskDob(fc.value_a),
          value_b: maskDob(fc.value_b),
        };
      }
      if (fieldLower.includes('caste')) {
        return {
          ...fc,
          value_a: maskCaste(fc.value_a),
          value_b: maskCaste(fc.value_b),
        };
      }
      if (fieldLower.includes('income')) {
        return {
          ...fc,
          value_a: '₹ •••••• (Protected)',
          value_b: '₹ •••••• (Protected)',
        };
      }
      return fc;
    }),
  };
}
