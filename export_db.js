const mysql = require('mysql2/promise');
const fs = require('fs');

async function exportSchema() {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306,
    user: 'root', password: '123456',
    database: 'english_app'
  });

  let sql = `-- English App Database Export\n-- Generated: ${new Date().toISOString()}\n\nSET FOREIGN_KEY_CHECKS=0;\n\n`;

  // Get all tables
  const [tables] = await conn.query("SHOW TABLES");
  const tableKey = Object.keys(tables[0])[0];

  for (const row of tables) {
    const tableName = row[tableKey];
    // Drop + Create table
    const [[createRow]] = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
    sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sql += createRow['Create Table'] + ';\n\n';

    // Insert data
    const [rows] = await conn.query(`SELECT * FROM \`${tableName}\``);
    if (rows.length > 0) {
      const cols = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
      for (const r of rows) {
        const vals = Object.values(r).map(v =>
          v === null ? 'NULL' : `'${String(v).replace(/'/g, "\\'")}' `
        ).join(', ');
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
