import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data';
import { fetchLiveStatsFromSupabase } from '@/lib/supabase/db';

export async function GET() {
  const dbStats = await fetchLiveStatsFromSupabase();
  if (dbStats) {
    return NextResponse.json(dbStats);
  }

  const inMemoryStats = getDashboardStats();
  return NextResponse.json({
    ...inMemoryStats,
    state_metrics: {
      citizens_monitored: '6.5 Cr+',
      households_connected: '1.4 Cr+',
      gujarat_districts: '33',
      state_schemes: '20',
      proactive_disbursals: '₹1,200 Cr+',
    },
    data_source: 'In-Memory Fallback',
  });
}

