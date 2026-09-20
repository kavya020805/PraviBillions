import { NextResponse } from 'next/server';
import { getFamilyById, persistFamilyUpdate } from '@/lib/data';
import { evaluateEligibility, diffEligibility } from '@/lib/rules-engine';
import { getLifeEventByType, validateLifeEvent } from '@/lib/life-events';
import { getServerUser, canMutateFamily } from '@/lib/auth-server';
import type { LifeEventParams, LifeEventLogEntry } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
    }

    const { family_id, event_type, params, apply } = body as {
      family_id?: string;
      event_type?: string;
      params?: LifeEventParams;
      apply?: boolean; // If true, persist the change to the database
    };

    if (!family_id || typeof family_id !== 'string') {
      return NextResponse.json({ error: 'Valid family_id is required' }, { status: 400 });
    }

    if (!event_type || typeof event_type !== 'string') {
      return NextResponse.json({ error: 'Valid event_type is required' }, { status: 400 });
    }

    const family = getFamilyById(family_id);
    if (!family) {
      return NextResponse.json({ error: 'Family record not found in Gujarat registry' }, { status: 404 });
    }

    const lifeEvent = getLifeEventByType(event_type);
    if (!lifeEvent) {
      return NextResponse.json({ error: `Unknown event type: ${event_type}` }, { status: 400 });
    }

    // Role-Based Access Control:
    // Anyone can simulate (apply = false).
    // Only verified household owners or administrators can commit changes to the database (apply = true).
    if (apply) {
      const user = await getServerUser();
      const auth = canMutateFamily(user, family_id);
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.reason }, { status: auth.statusCode });
      }
    }

    // Strict domain and logical validation
    const validation = validateLifeEvent(family, event_type, params);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Snapshot before
    const beforeResults = evaluateEligibility(family);

    // Apply event to generate updated family
    const updatedFamily = lifeEvent.apply(family, params);

    // Evaluate after
    const afterResults = evaluateEligibility(updatedFamily);

    // Compute eligibility differential delta
    const diff = diffEligibility(beforeResults, afterResults);

    // Persist to Supabase and memory if requested
    if (apply) {
      const logEntry: LifeEventLogEntry = {
        id: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        family_id,
        event_type: lifeEvent.type,
        event_label: lifeEvent.label,
        event_details: JSON.stringify(params || {}),
        eligibility_changes: {
          gained: diff.gained.map(g => g.scheme.name),
          lost: diff.lost.map(l => l.scheme.name),
        },
        applied_at: new Date().toISOString(),
      };

      try {
        await persistFamilyUpdate(updatedFamily, logEntry);
      } catch (dbErr) {
        console.error('Supabase write-through failed in /api/events:', dbErr);
        return NextResponse.json(
          { error: 'Failed to persist updates to the database: ' + (dbErr as Error).message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      event_type,
      event_label: lifeEvent.label,
      family_before: family,
      family_after: updatedFamily,
      diff: {
        gained: diff.gained.map(g => ({
          scheme_id: g.scheme_id,
          scheme_name: g.scheme.name,
          scheme_name_hi: g.scheme.name_hi,
          scheme_name_gu: g.scheme.name_gu,
          category: g.scheme.category,
          benefit: g.scheme.benefit,
          description: g.scheme.description,
          member_name: g.member_name,
        })),
        lost: diff.lost.map(l => ({
          scheme_id: l.scheme_id,
          scheme_name: l.scheme.name,
          scheme_name_hi: l.scheme.name_hi,
          scheme_name_gu: l.scheme.name_gu,
          category: l.scheme.category,
          benefit: l.scheme.benefit,
          description: l.scheme.description,
          member_name: l.member_name,
        })),
        unchanged_count: diff.unchanged.length,
      },
      applied: Boolean(apply),
    });
  } catch (err) {
    console.error('Unhandled error in /api/events:', err);
    return NextResponse.json(
      { error: 'Internal server error processing life event: ' + (err as Error).message },
      { status: 500 }
    );
  }
}
