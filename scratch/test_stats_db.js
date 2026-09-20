const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.vyixntenvmrxrsezxwyt:XuEL1Ree3ip4PRlB@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const [metricsRes, famCountRes, memCountRes, distCountRes, dupCountRes] = await Promise.all([
    pool.query('SELECT * FROM public.state_metrics ORDER BY metric_key ASC'),
    pool.query('SELECT COUNT(*) FROM public.families'),
    pool.query('SELECT COUNT(*) FROM public.members'),
    pool.query('SELECT COUNT(DISTINCT district) FROM public.families'),
    pool.query("SELECT COUNT(*) FROM public.duplicate_pairs WHERE status = 'pending'"),
  ]);

  const stateMetricsMap = {};
  for (const row of metricsRes.rows) {
    stateMetricsMap[row.metric_key] = row.metric_value;
  }

  const result = {
    total_families: Number(famCountRes.rows[0].count),
    total_members: Number(memCountRes.rows[0].count),
    total_schemes_tracked: 20,
    total_eligible_benefits: 179,
    flagged_duplicates: Number(dupCountRes.rows[0].count),
    districts_covered: Number(distCountRes.rows[0].count),
    state_metrics: {
      citizens_monitored: stateMetricsMap['citizens_monitored'] || '6.5 Cr+',
      households_connected: stateMetricsMap['households_connected'] || '1.4 Cr+',
      gujarat_districts: stateMetricsMap['gujarat_districts'] || '33',
      state_schemes: stateMetricsMap['state_schemes'] || '20',
      proactive_disbursals: stateMetricsMap['proactive_disbursals'] || '₹1,200 Cr+',
    },
    metrics_list: metricsRes.rows,
    data_source: 'PostgreSQL Database (aws-0-ap-southeast-1.pooler.supabase.com)',
  };

  console.log('Stats Result:', JSON.stringify(result, null, 2));
  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
