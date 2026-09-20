// ============================================================
// Supabase Database Migration & Seeding Script
// ============================================================

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { syntheticFamilies } from '../lib/data';
import { scanForDuplicates, DEFAULT_WEIGHTS } from '../lib/matching-engine';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL ||
  'postgresql://postgres.vyixntenvmrxrsezxwyt:XuEL1Ree3ip4PRlB@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function migrate() {
  console.log('Connecting to Supabase PostgreSQL at aws-0-ap-southeast-1...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected successfully to Supabase PostgreSQL!');

    // 1. Execute DDL Schema
    console.log('\n--- 1. Executing DDL Schema ---');
    const schemaPath = path.join(__dirname, '../lib/supabase/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Schema tables created successfully!');

    // 2. Seed Families
    console.log('\n--- 2. Seeding Families & Members ---');
    let familiesInserted = 0;
    let membersInserted = 0;

    for (const fam of syntheticFamilies) {
      await client.query(
        `INSERT INTO public.families (
          family_id, district, household_income_annual, income_band,
          caste_category, land_owned_acres, house_type, phone_number,
          address, pincode, area_type, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (family_id) DO UPDATE SET
          district = EXCLUDED.district,
          household_income_annual = EXCLUDED.household_income_annual,
          income_band = EXCLUDED.income_band,
          caste_category = EXCLUDED.caste_category,
          land_owned_acres = EXCLUDED.land_owned_acres,
          house_type = EXCLUDED.house_type,
          phone_number = EXCLUDED.phone_number,
          address = EXCLUDED.address,
          pincode = EXCLUDED.pincode,
          area_type = EXCLUDED.area_type,
          last_updated = EXCLUDED.last_updated`,
        [
          fam.family_id,
          fam.district,
          fam.household_income_annual,
          fam.income_band,
          fam.caste_category,
          fam.land_owned_acres,
          fam.house_type,
          fam.phone_number,
          fam.address,
          fam.pincode,
          fam.area_type,
          fam.last_updated || new Date().toISOString(),
        ]
      );
      familiesInserted++;

      // Seed Members for this family
      for (const m of fam.members) {
        await client.query(
          `INSERT INTO public.members (
            member_id, family_id, name, relation_to_head, dob,
            gender, marital_status, occupation, disability_status,
            disability_percentage, education_level, is_bpl, is_alive, is_pregnant
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (member_id) DO UPDATE SET
            name = EXCLUDED.name,
            relation_to_head = EXCLUDED.relation_to_head,
            dob = EXCLUDED.dob,
            gender = EXCLUDED.gender,
            marital_status = EXCLUDED.marital_status,
            occupation = EXCLUDED.occupation,
            disability_status = EXCLUDED.disability_status,
            disability_percentage = EXCLUDED.disability_percentage,
            education_level = EXCLUDED.education_level,
            is_bpl = EXCLUDED.is_bpl,
            is_alive = EXCLUDED.is_alive,
            is_pregnant = EXCLUDED.is_pregnant`,
          [
            m.member_id,
            fam.family_id,
            m.name,
            m.relation_to_head,
            m.dob,
            m.gender,
            m.marital_status,
            m.occupation,
            m.disability_status,
            m.disability_percentage ?? null,
            m.education_level,
            m.is_bpl,
            m.is_alive,
            m.is_pregnant ?? false,
          ]
        );
        membersInserted++;
      }
    }
    console.log(`Inserted / Synchronized ${familiesInserted} families and ${membersInserted} members!`);

    // 3. Seed Duplicate Pairs
    console.log('\n--- 3. Seeding Duplicate Pairs ---');
    const duplicatePairs = scanForDuplicates(syntheticFamilies, DEFAULT_WEIGHTS);
    let duplicatesInserted = 0;

    for (const pair of duplicatePairs) {
      await client.query(
        `INSERT INTO public.duplicate_pairs (
          id, family_a_id, family_b_id, family_a_head_name, family_b_head_name,
          confidence_score, status, signals, field_comparisons, flagged_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          confidence_score = EXCLUDED.confidence_score,
          status = EXCLUDED.status,
          signals = EXCLUDED.signals,
          field_comparisons = EXCLUDED.field_comparisons`,
        [
          pair.id,
          pair.family_a_id,
          pair.family_b_id,
          pair.family_a_head_name,
          pair.family_b_head_name,
          pair.confidence_score,
          pair.status,
          JSON.stringify(pair.signals),
          JSON.stringify(pair.field_comparison),
          pair.flagged_at || new Date().toISOString(),
        ]
      );
      duplicatesInserted++;
    }
    console.log(`Inserted / Synchronized ${duplicatesInserted} duplicate pairs!`);

    // 4. Seed Pre-configured Demo Profiles (Admin & Citizen)
    console.log('\n--- 4. Seeding Demo Profiles ---');
    const demoProfiles = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@gujarat.gov.in',
        full_name: 'Bhupendrabhai Patel (District Collector / Talati Administrator)',
        role: 'admin',
        family_id: null,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'citizen@gujarat.gov.in',
        full_name: 'Rameshbhai Patel (Citizen Beneficiary & Household Head)',
        role: 'citizen',
        family_id: '240100000001', // Primary Patel Family
      },
    ];

    for (const p of demoProfiles) {
      await client.query(
        `INSERT INTO public.profiles (id, email, full_name, role, family_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           full_name = EXCLUDED.full_name,
           role = EXCLUDED.role,
           family_id = EXCLUDED.family_id`,
        [p.id, p.email, p.full_name, p.role, p.family_id]
      );
    }
    console.log('Seeded demo Admin and Citizen profiles!');

    // 5. Verification queries
    console.log('\n--- 5. Database Verification ---');
    const famCount = await client.query('SELECT count(*) FROM public.families');
    const memCount = await client.query('SELECT count(*) FROM public.members');
    const dupCount = await client.query('SELECT count(*) FROM public.duplicate_pairs');
    const profCount = await client.query('SELECT count(*) FROM public.profiles');

    console.log(`Verified counts in Supabase:
- Families: ${famCount.rows[0].count}
- Members: ${memCount.rows[0].count}
- Duplicate Pairs: ${dupCount.rows[0].count}
- Profiles: ${profCount.rows[0].count}`);

    console.log('\nMigration to Supabase completed successfully! 🎉');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
