import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  INITIAL_STORE_SETTINGS, 
  INITIAL_INGREDIENTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_EXPENSES, 
  INITIAL_ORDERS 
} from '../src/data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'merienda.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize Database Schema
export function initDatabase() {
  db.exec(`
    -- Store Settings Table
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Ingredients Table
    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      current_stock REAL NOT NULL DEFAULT 0,
      min_stock_threshold REAL NOT NULL DEFAULT 0,
      target_stock REAL NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      package_unit TEXT,
      package_cost REAL DEFAULT 0,
      supplier TEXT
    );

    -- Menu Products Table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      emoji TEXT,
      badge TEXT,
      description TEXT,
      recipe_json TEXT NOT NULL
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      customer_name TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      cash_received REAL,
      change_given REAL,
      ref_number TEXT,
      status TEXT NOT NULL DEFAULT 'Completed',
      items_json TEXT NOT NULL
    );

    -- Expenses Table
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      receipt_no TEXT,
      notes TEXT
    );
  `);

  // Check if initial seeding is needed
  const ingCount = db.prepare('SELECT COUNT(*) as count FROM ingredients').get().count;
  if (ingCount === 0) {
    seedDatabase();
  }
}

// Seed Initial Data
export function seedDatabase() {
  const resetTransaction = db.transaction(() => {
    // Clear existing
    db.prepare('DELETE FROM store_settings').run();
    db.prepare('DELETE FROM ingredients').run();
    db.prepare('DELETE FROM products').run();
    db.prepare('DELETE FROM expenses').run();
    db.prepare('DELETE FROM orders').run();

    // Insert Store Settings
    const insertSetting = db.prepare('INSERT INTO store_settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(INITIAL_STORE_SETTINGS)) {
      insertSetting.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }

    // Insert Ingredients
    const insertIng = db.prepare(`
      INSERT INTO ingredients (
        id, name, category, unit, current_stock, min_stock_threshold, 
        target_stock, unit_cost, package_unit, package_cost, supplier
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ing of INITIAL_INGREDIENTS) {
      insertIng.run(
        ing.id, ing.name, ing.category, ing.unit, ing.currentStock,
        ing.minStockThreshold, ing.targetStock, ing.unitCost,
        ing.packageUnit, ing.packageCost, ing.supplier
      );
    }

    // Insert Products
    const insertProd = db.prepare(`
      INSERT INTO products (
        id, name, category, price, emoji, badge, description, recipe_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of INITIAL_MENU_ITEMS) {
      insertProd.run(
        item.id, item.name, item.category, item.price, item.emoji,
        item.badge, item.description, JSON.stringify(item.recipe || [])
      );
    }

    // Insert Initial Expenses
    const insertExp = db.prepare(`
      INSERT INTO expenses (
        id, date, title, category, amount, payment_method, receipt_no, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const exp of INITIAL_EXPENSES) {
      insertExp.run(
        exp.id, exp.date, exp.title, exp.category, exp.amount,
        exp.paymentMethod, exp.receiptNo, exp.notes
      );
    }

    // Insert Initial Orders
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id, timestamp, customer_name, subtotal, discount, total_amount, 
        payment_method, cash_received, change_given, ref_number, status, items_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ord of INITIAL_ORDERS) {
      insertOrder.run(
        ord.id, ord.timestamp, ord.customerName, ord.subtotal, ord.discount,
        ord.totalAmount, ord.paymentMethod, ord.cashReceived, ord.changeGiven,
        ord.refNumber || null, ord.status, JSON.stringify(ord.items || [])
      );
    }
  });

  resetTransaction();
  console.log('✅ SQLite Database successfully initialized and seeded with Kieran & Kyr\'s Merienda menu!');
}

export default db;
