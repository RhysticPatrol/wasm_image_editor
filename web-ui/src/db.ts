import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

export async function initDb() {
  if (db) return db;
  // sql.js needs to fetch its wasm file. We'll use the unpkg CDN for simplicity in Vite.
  const SQL = await initSqlJs({
    locateFile: file => `https://unpkg.com/sql.js@1.10.2/dist/${file}`
  });
  
  db = new SQL.Database();
  
  db.run(`
    CREATE TABLE edit_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      filter TEXT,
      width INTEGER,
      height INTEGER,
      execution_time_ms REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
}

export function logEdit(filename: string, filter: string, width: number, height: number, executionTimeMs: number) {
  if (!db) return;
  db.run(
    'INSERT INTO edit_history (filename, filter, width, height, execution_time_ms) VALUES (?, ?, ?, ?, ?)',
    [filename, filter, width, height, executionTimeMs]
  );
}

export function getEditHistory() {
  if (!db) return [];
  const result = db.exec('SELECT * FROM edit_history ORDER BY id DESC');
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map(row => {
    const obj: any = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
}
