import { NextResponse } from 'next/server';
import { getFamilyById, getEventLog } from '@/lib/data';
import { evaluateEligibility, getUniqueEligibleSchemeIds } from '@/lib/rules-engine';
import { schemeRules } from '@/lib/schemes';

import { getServerUser } from '@/lib/auth-server';
import { maskFamilyForRole } from '@/lib/privacy';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  const { familyId } = await params;
  let family = getFamilyById(familyId);

  if (!family) {
    const { fetchFamilyByIdFromSupabase } = await import('@/lib/supabase/db');
    const dbFam = await fetchFamilyByIdFromSupabase(familyId);
    if (dbFam) {
      const { addFamily } = await import('@/lib/data');
      addFamily(dbFam);
      family = dbFam;
    }
  }

  if (!family) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 });
  }

  const eligibility = evaluateEligibility(family);
  const eligibleSchemeIds = getUniqueEligibleSchemeIds(family);
  const eventHistory = getEventLog(familyId);

  // Authenticate requester to enforce DPDP Act 2023 privacy redaction
  const user = await getServerUser();
  const isOwner = Boolean(user && user.role === 'citizen' && user.family_id === familyId);
  const safeFamily = maskFamilyForRole(family, isOwner);

  // Enrich eligibility with full scheme details
  const eligibleSchemes = eligibleSchemeIds.map(id => {
    const scheme = schemeRules.find(s => s.id === id)!;
    const memberResults = eligibility.filter(r => r.scheme_id === id && r.eligible);
    return {
      ...scheme,
      eligibility_predicate: undefined, // Don't serialize functions
      eligible_members: memberResults.map(r => ({
        member_id: r.member_id,
        member_name: r.member_name,
      })),
    };
  });

  return NextResponse.json({
    family: safeFamily,
    eligible_schemes: eligibleSchemes,
    eligible_count: eligibleSchemeIds.length,
    event_history: eventHistory,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  const { familyId } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.action === 'reset') {
    const { getServerUser, canMutateFamily } = await import('@/lib/auth-server');
    const user = await getServerUser();
    const auth = canMutateFamily(user, familyId);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: auth.statusCode });
    }

    const { resetFamily } = await import('@/lib/data');
    const reset = await resetFamily(familyId);
    if (!reset) return NextResponse.json({ error: 'Family record not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Family reset to original state', family: reset });
  }

  return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
}

