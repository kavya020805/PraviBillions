const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.vyixntenvmrxrsezxwyt:XuEL1Ree3ip4PRlB@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Connecting to PostgreSQL...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.state_metrics (
      metric_key VARCHAR(64) PRIMARY KEY,
      metric_label VARCHAR(128) NOT NULL,
      metric_value VARCHAR(64) NOT NULL,
      numeric_value BIGINT DEFAULT 0,
      unit VARCHAR(32) DEFAULT '',
      category VARCHAR(64) DEFAULT 'macro_state',
      last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Table state_metrics created or verified.');

  const metrics = [
    { key: 'citizens_monitored', label: 'Citizens Monitored', value: '6.5 Cr+', numeric: 65000000, unit: 'Citizens' },
    { key: 'households_connected', label: 'Households Connected', value: '1.4 Cr+', numeric: 14000000, unit: 'Households' },
    { key: 'gujarat_districts', label: 'Gujarat Districts', value: '33', numeric: 33, unit: 'Districts' },
    { key: 'state_schemes', label: 'State & Central Schemes', value: '20', numeric: 20, unit: 'Schemes' },
    { key: 'proactive_disbursals', label: 'Proactive Disbursals', value: '₹1,200 Cr+', numeric: 12000000000, unit: 'INR' },
  ];

  for (const m of metrics) {
    await pool.query(`
      INSERT INTO public.state_metrics (metric_key, metric_label, metric_value, numeric_value, unit, last_updated)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (metric_key) DO UPDATE
      SET metric_label = EXCLUDED.metric_label,
          metric_value = EXCLUDED.metric_value,
          numeric_value = EXCLUDED.numeric_value,
          unit = EXCLUDED.unit,
          last_updated = CURRENT_TIMESTAMP
    `, [m.key, m.label, m.value, m.numeric, m.unit]);
  }

  const rows = await pool.query('SELECT * FROM public.state_metrics ORDER BY metric_key');
  console.log('State metrics in database:', rows.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
