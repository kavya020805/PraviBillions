import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchProfileByEmail, type UserProfile } from '@/lib/supabase/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('family_copilot_user');

    if (!userCookie?.value) {
      return NextResponse.json({ user: null });
    }

    const parsed = JSON.parse(userCookie.value) as UserProfile;
    // Verify latest profile from database
    const profile = await fetchProfileByEmail(parsed.email);
    return NextResponse.json({ user: profile || parsed });
  } catch {
    return NextResponse.json({ user: null });
  }
}
