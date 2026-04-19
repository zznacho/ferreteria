import initSqlJs from 'sql.js';
import { v4 as uuidv4 } from 'uuid';

class LocalDatabase {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init() {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
    
    this.db = new SQL.Database();
    await this.createTables();
    this.initialized = true;
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT,
        role TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT,
        product_id TEXT,
        quantity INTEGER,
        price_at_time REAL,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`,
      `CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT,
        record_id TEXT,
        action TEXT,
        data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced BOOLEAN DEFAULT 0
      )`
    ];
    
    for (const query of queries) {
      this.db.run(query);
    }
  }

  execute(sql, params = []) {
    return this.db.exec(sql, params);
  }

  query(sql, params = [) {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    
    return results;
  }

  async logChange(table, recordId, action, data) {
    const sql = `
      INSERT INTO sync_log (table_name, record_id, action, data, synced)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    this.db.run(sql, [
      table,
      recordId,
      action,
      JSON.stringify(data),
      0
    ]);
  }

  getPendingChanges() {
    return this.query(`
      SELECT * FROM sync_log 
      WHERE synced = 0 
      ORDER BY timestamp ASC
    `);
  }

  markAsSynced(logIds) {
    const placeholders = logIds.map(() => '?').join(',');
    this.db.run(`
      UPDATE sync_log 
      SET synced = 1 
      WHERE id IN (${placeholders})
    `, logIds);
  }

  async save() {
    const data = this.db.export();
    localStorage.setItem('ferreteria_db', JSON.stringify(Array.from(data)));
  }

  async load() {
    const saved = localStorage.getItem('ferreteria_db');
    if (saved) {
      const data = new Uint8Array(JSON.parse(saved));
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      this.db = new SQL.Database(data);
      this.initialized = true;
    } else {
      await this.init();
    }
  }
}

export const localDB = new LocalDatabase();