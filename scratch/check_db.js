const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.vyixntenvmrxrsezxwyt:XuEL1Ree3ip4PRlB@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables in public schema:', tables.rows.map(r => r.table_name));

  for (const table of tables.rows.map(r => r.table_name)) {
    const count = await pool.query(`SELECT COUNT(*) FROM public."${table}"`);
    console.log(`Count in ${table}:`, count.rows[0].count);
  }
  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
