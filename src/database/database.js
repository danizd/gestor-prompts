import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use a dedicated 'data' directory for the database
const DATA_DIR = join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : join(DATA_DIR, 'prompts.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
    this.init();
  }

  async init() {
    try {
      await this.run(`
        CREATE TABLE IF NOT EXISTS prompts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          texto TEXT NOT NULL,
          categoria TEXT,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await this.run(`
        CREATE TABLE IF NOT EXISTS tareas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tarea TEXT NOT NULL,
          recurso TEXT,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close(err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const db = new Database();

// Close the database connection when the process exits
process.on('exit', () => db.close());
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());
