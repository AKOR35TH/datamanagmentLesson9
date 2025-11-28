const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Erro conectando ao banco:', err.message);
      } else {
        console.log('✅ Conectado ao SQLite');
        this.initTable();
      }
    });
  }

  initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    this.db.run(sql, (err) => {
      if (err) console.error("❌ Erro criando tabela:", err.message);
    });
  }

  insertUser(name, email) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (name, email) VALUES (?, ?)`;
      this.db.run(sql, [name, email], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, email });
      });
    });
  }

  getAllUsers() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users ORDER BY id DESC`;
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database();