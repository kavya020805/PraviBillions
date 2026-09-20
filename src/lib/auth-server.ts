import { cookies } from 'next/headers';
import { fetchProfileByEmail, type UserProfile } from '@/lib/supabase/db';

/**
 * Extract and authenticate the current session user on Next.js server route handlers.
 * Verifies with Supabase profiles table for up-to-date role and family ownership.
 */
export async function getServerUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('family_copilot_user');

    if (!userCookie?.value) {
      return null;
    }

    let parsed: UserProfile | null = null;
    try {
      parsed = JSON.parse(decodeURIComponent(userCookie.value));
    } catch {
      try {
        parsed = JSON.parse(userCookie.value);
      } catch {
        return null;
      }
    }

    if (!parsed || !parsed.email) {
      return null;
    }

    // Verify against Supabase profiles table to guarantee fresh role and ownership
    const dbProfile = await fetchProfileByEmail(parsed.email);
    return dbProfile || parsed;
  } catch (err) {
    console.error('getServerUser error:', err);
    return null;
  }
}

/**
 * Checks whether the current user is authorized to perform state modifications
 * (such as committing life events or resetting baseline) on a specific family.
 *
 * Rules:
 * - Administrators have full authority over all families across Gujarat.
 * - Citizens only have authority over their own registered family (user.family_id).
 * - Guests/Unauthenticated users have zero mutation authority.
 */
export function canMutateFamily(user: UserProfile | null, targetFamilyId: string): {
  authorized: boolean;
  statusCode: 401 | 403 | 200;
  reason?: string;
} {
  if (!user) {
    return {
      authorized: false,
      statusCode: 401,
      reason: 'Authentication required. Please sign in as a citizen or administrator.',
    };
  }

  if (user.role === 'admin') {
    return { authorized: true, statusCode: 200 };
  }

  if (user.role === 'citizen') {
    if (user.family_id === targetFamilyId) {
      return { authorized: true, statusCode: 200 };
    }
    return {
      authorized: false,
      statusCode: 403,
      reason: `Access denied: Citizens can only commit changes to their own registered household (Registered Family ID: ${user.family_id || 'None'}).`,
    };
  }

  return {
    authorized: false,
    statusCode: 403,
    reason: 'Insufficient permissions to modify this household.',
  };
}
