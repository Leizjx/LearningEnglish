const mysql = require('mysql2/promise');
const fs = require('fs');

function toMySQLDate(val) {
  if (!val) return 'NULL';
  const d = new Date(val);
  if (isNaN(d.getTime())) return `'${String(val).replace(/'/g, "\\'")}'`;
  // Format as YYYY-MM-DD HH:MM:SS in UTC
  return `'${d.toISOString().replace('T', ' ').substring(0, 19)}'`;
}

function escapeVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v instanceof Date) return toMySQLDate(v);
  const s = String(v);
  // Check if it looks like a JS date string
  if (/^\w{3} \w{3} \d{2} \d{4}/.test(s)) return toMySQLDate(s);
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

async function exportSchema() {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306,
    user: 'root', password: '',
    database: 'english_app'
  });

  let sql = `-- English App Database Export\n-- Generated: ${new Date().toISOString()}\n\nSET FOREIGN_KEY_CHECKS=0;\nSET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';\n\n`;

  const [tables] = await conn.query("SHOW TABLES");
  const tableKey = Object.keys(tables[0])[0];

  for (const row of tables) {
    const tableName = row[tableKey];
    const [[createRow]] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
    sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sql += createRow['Create Table'] + ';\n\n';

    const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
    if (rows.length > 0) {
      const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
      for (const r of rows) {
        const vals = Object.values(r).map(escapeVal).join(', ');
        sql += `INSERT INTO \`${tableName}\` (${cols}) VALUES (${vals});\n`;
      }
      sql += '\n';
    }
  }

  sql += `SET FOREIGN_KEY_CHECKS=1;\n`;
  fs.writeFileSync('C:/Users/Admin/Desktop/english_app_backup.sql', sql);
  console.log('✅ Export done! File: C:/Users/Admin/Desktop/english_app_backup.sql');
  await conn.end();
}

exportSchema().catch(console.error);
