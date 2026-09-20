import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST() {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('family_copilot_user');
  return response;
}
