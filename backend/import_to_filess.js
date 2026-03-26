const mysql = require('mysql2/promise');

function escapeVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v);
  // Convert JS date strings to MySQL format
  if (/^\w{3} \w{3} \d{2} \d{4}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return `'${d.toISOString().replace('T', ' ').substring(0, 19)}'`;
  }
  if (v instanceof Date) return `'${v.toISOString().replace('T', ' ').substring(0, 19)}'`;
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// Remove FK constraints from CREATE TABLE
function stripFKConstraints(createSql) {
  const lines = createSql.split('\n');
  const filtered = lines.filter(l => {
    const t = l.trim();
    return !t.startsWith('CONSTRAINT') && !t.startsWith('KEY ');
  });
  // Remove trailing comma from last column definition
  let result = filtered.join('\n');
  result = result.replace(/,(\s*\n\s*\))/g, '$1');
  return result;
}

async function importToFiless() {
  // Local source DB
  const src = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: '', database: 'english_app' });

  // Filess.io target DB
  const dst = await mysql.createConnection(
    'mysql://english_app_slippedas:25a9f59e5d96cc82adb7049be45f4a939df7066e@vwdvbp.h.filess.io:61002/english_app_slippedas'
  );
  console.log('✅ Connected to both DBs!');

  await dst.query('SET FOREIGN_KEY_CHECKS=0');

  const [tables] = await src.query("SHOW TABLES");
  const tableKey = Object.keys(tables[0])[0];

  for (const row of tables) {
    const tableName = row[tableKey];
    try {
      // Drop and recreate table
      await dst.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      const [[createRow]] = await src.query(`SHOW CREATE TABLE \`${tableName}\``);
      const cleanCreate = stripFKConstraints(createRow['Create Table']);
      await dst.query(cleanCreate);
      console.log(`✅ Table ${tableName} created`);

      // Insert data
      const [rows] = await src.query(`SELECT * FROM \`${tableName}\``);
      for (const r of rows) {
        const cols = Object.keys(r).map(c => `\`${c}\``).join(', ');
        const vals = Object.values(r).map(escapeVal).join(', ');
        await dst.query(`INSERT INTO \`${tableName}\` (${cols}) VALUES (${vals})`);
      }
      console.log(`  ↳ ${rows.length} rows inserted`);
    } catch (err) {
      console.error(`❌ Error on ${tableName}:`, err.message);
    }
  }

  await dst.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('\n✅ Migration complete!');
  await src.end();
  await dst.end();
}

importToFiless().catch(console.error);
