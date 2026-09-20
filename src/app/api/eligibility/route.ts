import { NextResponse } from 'next/server';
import { evaluateEligibility } from '@/lib/rules-engine';
import { schemeRules } from '@/lib/schemes';
import type { Family } from '@/lib/types';

export async function POST(request: Request) {
  const body = await request.json();
  const family = body.family as Family;

  if (!family) {
    return NextResponse.json({ error: 'Family object required' }, { status: 400 });
  }

  const results = evaluateEligibility(family);
  const eligibleResults = results.filter(r => r.eligible);
  const uniqueSchemeIds = [...new Set(eligibleResults.map(r => r.scheme_id))];

  const eligibleSchemes = uniqueSchemeIds.map(id => {
    const scheme = schemeRules.find(s => s.id === id)!;
    const memberResults = eligibleResults.filter(r => r.scheme_id === id);
    return {
      id: scheme.id,
      name: scheme.name,
      name_hi: scheme.name_hi,
      name_gu: scheme.name_gu,
      description: scheme.description,
      description_hi: scheme.description_hi,
      description_gu: scheme.description_gu,
      benefit: scheme.benefit,
      benefit_hi: scheme.benefit_hi,
      benefit_gu: scheme.benefit_gu,
      category: scheme.category,
      next_steps: scheme.next_steps,
      next_steps_hi: scheme.next_steps_hi,
      next_steps_gu: scheme.next_steps_gu,
      scope: scheme.scope,
      eligible_members: memberResults.map(r => ({
        member_id: r.member_id,
        member_name: r.member_name,
      })),
    };
  });

  return NextResponse.json({
    total_schemes_checked: schemeRules.length,
    eligible_count: uniqueSchemeIds.length,
    eligible_schemes: eligibleSchemes,
    all_results: results,
  });
}
