import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { upsertProfileInSupabase, upsertFamilyToSupabase } from '@/lib/supabase/db';
import type { Family } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      full_name,
      role = 'citizen',
      family_id,
      district = 'Ahmedabad',
      area_type = 'urban',
      phone_number = '',
    } = body as {
      email?: string;
      password?: string;
      full_name?: string;
      role?: 'admin' | 'citizen';
      family_id?: string;
      district?: string;
      area_type?: 'urban' | 'rural';
      phone_number?: string;
    };

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const normEmail = email.trim().toLowerCase();

    // 1. Register with Supabase GoTrue Auth
    let assignedFamilyId = family_id?.trim() || null;

    // If citizen and no family_id specified, auto-create a new Family ID
    if (role === 'citizen' && !assignedFamilyId) {
      assignedFamilyId = '24' + Math.floor(1000000000 + Math.random() * 9000000000).toString().substring(0, 10);

      const newFamily: Family = {
        family_id: assignedFamilyId,
        district,
        household_income_annual: 95000,
        income_band: 'bpl',
        caste_category: 'general',
        land_owned_acres: 0,
        house_type: 'pucca',
        phone_number: phone_number || '98' + Math.floor(10000000 + Math.random() * 90000000),
        address: `House No. ${Math.floor(10 + Math.random() * 90)}, Ward 4, ${district}`,
        pincode: '380001',
        area_type,
        created_by: normEmail,
        last_updated: new Date().toISOString(),
        members: [
          {
            member_id: 'MEM' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            family_id: assignedFamilyId,
            name: full_name,
            relation_to_head: 'head',
            dob: '1985-06-15',
            gender: 'male',
            marital_status: 'married',
            occupation: 'self_employed',
            disability_status: false,
            education_level: 'secondary',
            is_bpl: true,
            is_alive: true,
          },
        ],
      };

      await upsertFamilyToSupabase(newFamily);
      const { addFamily } = await import('@/lib/data');
      addFamily(newFamily);
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normEmail,
      password,
      options: {
        data: {
          full_name,
          role,
          family_id: assignedFamilyId,
        },
      },
    });

    const userId = authData?.user?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000));

    // 2. Insert into profiles table
    const profile = await upsertProfileInSupabase({
      id: userId,
      email: normEmail,
      full_name,
      role: role === 'admin' ? 'admin' : 'citizen',
      family_id: assignedFamilyId,
    });

    const response = NextResponse.json({ success: true, user: profile });
    response.cookies.set('family_copilot_user', JSON.stringify(profile), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
