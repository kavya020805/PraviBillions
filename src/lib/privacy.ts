// ============================================================
// Family ID Copilot — DPDP Act 2023 Civic Privacy & Data Protection
// ============================================================

import type { Family, FamilyMember, DuplicatePair } from '@/lib/types';

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
 * Example: '42, Mahatma Gandhi Road, Navrangpura' -> '[Street Redacted · DPDP Act], Navrangpura'
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
};

/**
 * Core RBAC & Privacy Protection Gatekeeper:
 * - If requester is the verified citizen owner of this household (user.family_id === family.family_id),
 *   they receive full unredacted data.
 * - If requester is an administrator, talati officer, or unauthorized third-party,
 *   sensitive fields (phone number, exact street address, and exact day/month of birth) are automatically redacted.
 */
export function maskFamilyForRole(family: Family, isOwner: boolean): ProtectedFamily {
  if (isOwner) {
    return {
      ...family,
      is_masked: false,
    };
  }

  return {
    ...family,
    phone_number: maskPhoneNumber(family.phone_number),
    address: maskAddress(family.address, family.district),
    members: family.members.map(m => maskMemberForRole(m, false)),
    is_masked: true,
    mask_reason: 'DPDP Act 2023: Citizen phone, street address, and exact DOB are redacted for administrative personnel.',
  };
}

/**
 * Protects duplicate pairs viewed by administrators.
 * Masks raw phone numbers, street addresses, and head DOBs in field comparisons
 * while leaving match levels ('exact' | 'near' | 'different') and scoring intact.
 */
export function maskDuplicatePairForAuditor(pair: DuplicatePair): DuplicatePair {
  return {
    ...pair,
    field_comparison: pair.field_comparison.map(fc => {
      if (fc.field_name.toLowerCase().includes('phone')) {
        return {
          ...fc,
          value_a: maskPhoneNumber(fc.value_a),
          value_b: maskPhoneNumber(fc.value_b),
        };
      }
      if (fc.field_name.toLowerCase().includes('address')) {
        return {
          ...fc,
          value_a: maskAddress(fc.value_a),
          value_b: maskAddress(fc.value_b),
        };
      }
      if (fc.field_name.toLowerCase().includes('dob')) {
        return {
          ...fc,
          value_a: maskDob(fc.value_a),
          value_b: maskDob(fc.value_b),
        };
      }
      return fc;
    }),
  };
}
