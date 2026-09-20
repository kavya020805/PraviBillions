import { NextResponse } from 'next/server';
import { getAllFamilies } from '@/lib/data';
import { getUniqueEligibleSchemeIds } from '@/lib/rules-engine';

import { getServerUser } from '@/lib/auth-server';
import { maskPhoneNumber, maskAddress } from '@/lib/privacy';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();
  const district = searchParams.get('district');
  const caste = searchParams.get('caste');
  const incomeBand = searchParams.get('income_band');

  const user = await getServerUser();

  let families = getAllFamilies();

  // Apply filters
  if (search) {
    families = families.filter(f => {
      const headName = f.members.find(m => m.relation_to_head === 'head')?.name.toLowerCase() || '';
      return f.family_id.includes(search) || headName.includes(search) || f.district.toLowerCase().includes(search);
    });
  }
  if (district) {
    families = families.filter(f => f.district === district);
  }
  if (caste) {
    families = families.filter(f => f.caste_category === caste);
  }
  if (incomeBand) {
    families = families.filter(f => f.income_band === incomeBand);
  }

  // Add eligibility count and sanitize PII according to DPDP Act 2023
  const familiesWithEligibility = families.map(f => {
    const isOwner = Boolean(user && user.role === 'citizen' && user.family_id === f.family_id);
    return {
      ...f,
      phone_number: isOwner ? f.phone_number : maskPhoneNumber(f.phone_number),
      address: isOwner ? f.address : maskAddress(f.address, f.district),
      eligible_scheme_count: getUniqueEligibleSchemeIds(f).length,
      head_name: f.members.find(m => m.relation_to_head === 'head')?.name || 'Unknown',
      member_count: f.members.filter(m => m.is_alive).length,
      is_masked: !isOwner,
    };
  });

  return NextResponse.json(familiesWithEligibility);
}
