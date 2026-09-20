import { NextResponse } from 'next/server';
import { getDuplicatePairs, rescanDuplicates, updateDuplicateStatus } from '@/lib/data';
import { updateDuplicateStatusInSupabase } from '@/lib/supabase/db';
import { getServerUser } from '@/lib/auth-server';
import type { DuplicateWeights, DuplicateStatus } from '@/lib/types';

import { maskDuplicatePairForAuditor } from '@/lib/privacy';

export async function GET(request: Request) {
  // Check authorization: citizens are not authorized to view cross-household duplicate audits
  const user = await getServerUser();
  if (user && user.role === 'citizen') {
    return NextResponse.json(
      { error: 'Administrative audit privilege required to access cross-household deduplication records' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const threshold = searchParams.get('threshold');
  const nameWeight = searchParams.get('name_weight');
  const addressWeight = searchParams.get('address_weight');
  const dobWeight = searchParams.get('dob_weight');
  const phoneWeight = searchParams.get('phone_weight');
  const statusFilter = searchParams.get('status');

  const hasCustomWeights = Boolean(threshold || nameWeight || addressWeight || dobWeight || phoneWeight);
  const weights: DuplicateWeights | undefined = hasCustomWeights ? {
    threshold: threshold ? parseInt(threshold, 10) : 50,
    name_weight: nameWeight ? parseInt(nameWeight, 10) : 20,
    address_weight: addressWeight ? parseInt(addressWeight, 10) : 10,
    dob_weight: dobWeight ? parseInt(dobWeight, 10) : 30,
    phone_weight: phoneWeight ? parseInt(phoneWeight, 10) : 40,
  } : undefined;

  const allPairs = getDuplicatePairs(weights);
  let pairs = allPairs;
  if (statusFilter && statusFilter !== 'all') {
    pairs = pairs.filter(p => p.status === statusFilter);
  }

  // Redact sensitive personal data (phone, address, head DOB) for administrative audit view
  const safePairs = pairs.map(maskDuplicatePairForAuditor);

  return NextResponse.json({
    total_pairs: allPairs.length,
    pending: allPairs.filter(p => p.status === 'pending').length,
    confirmed: allPairs.filter(p => p.status === 'confirmed').length,
    false_positives: allPairs.filter(p => p.status === 'false_positive').length,
    pairs: safePairs,
  });
}

export async function POST(request: Request) {
  // Strict admin privilege required for modifying registry deduplication
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in as an administrative officer.' },
      { status: 401 }
    );
  }
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Administrative audit privilege required to modify deduplication records.' },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { action, pair_id, status, weights } = body as {
    action: 'scan' | 'update_status';
    pair_id?: string;
    status?: DuplicateStatus;
    weights?: DuplicateWeights;
  };

  if (action === 'scan') {
    const allPairs = rescanDuplicates(weights);
    return NextResponse.json({
      total_pairs: allPairs.length,
      pending: allPairs.filter(p => p.status === 'pending').length,
      confirmed: allPairs.filter(p => p.status === 'confirmed').length,
      false_positives: allPairs.filter(p => p.status === 'false_positive').length,
      pairs: allPairs.map(maskDuplicatePairForAuditor),
    });
  }

  if (action === 'update_status' && pair_id && status) {
    const updatedPair = updateDuplicateStatus(pair_id, status);
    try {
      await updateDuplicateStatusInSupabase(
        pair_id,
        status,
        updatedPair?.family_a_id,
        updatedPair?.family_b_id
      );
    } catch (err) {
      console.warn('Non-fatal: Failed to update duplicate status in Supabase:', err);
    }
    const allPairs = getDuplicatePairs();
    return NextResponse.json({
      success: true,
      pair_id,
      new_status: status,
      pair: updatedPair ? maskDuplicatePairForAuditor(updatedPair) : undefined,
      total_pairs: allPairs.length,
      pending: allPairs.filter(p => p.status === 'pending').length,
      confirmed: allPairs.filter(p => p.status === 'confirmed').length,
      false_positives: allPairs.filter(p => p.status === 'false_positive').length,
      pairs: allPairs.map(maskDuplicatePairForAuditor),
    });
  }

  return NextResponse.json({ error: 'Invalid action or parameters specified' }, { status: 400 });
}
