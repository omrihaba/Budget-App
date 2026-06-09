import { Platform } from 'react-native';
import { Transaction, Bill, SavingsGoal, CategoryBudget, CustomCategory } from '../types';

// expo-sqlite is native-only — use dynamic require so the module doesn't
// crash at import time when running in a browser (web preview).
let _SQLite: any = null;
function getSQLite() {
  if (_SQLite) return _SQLite;
  if (Platform.OS === 'web') throw new Error('SQLite not available on web');
  _SQLite = require('expo-sqlite');
  return _SQLite;
}

let _db: any = null;

async function db(): Promise<any> {
  if (_db) return _db;
  const SQLite = getSQLite();
  _db = await SQLite.openDatabaseAsync('budget.db');
  await _db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id           TEXT PRIMARY KEY NOT NULL,
      title        TEXT NOT NULL,
      amount       REAL NOT NULL DEFAULT 0,
      is_income    INTEGER NOT NULL DEFAULT 0,
      category     TEXT NOT NULL DEFAULT 'other',
      date         TEXT NOT NULL,
      notes        TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS bills (
      id              TEXT PRIMARY KEY NOT NULL,
      title           TEXT NOT NULL,
      amount          REAL NOT NULL DEFAULT 0,
      due_date        TEXT NOT NULL,
      recurrence      TEXT NOT NULL DEFAULT 'monthly',
      is_paid         INTEGER NOT NULL DEFAULT 0,
      notes           TEXT NOT NULL DEFAULT '',
      notification_id TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id            TEXT PRIMARY KEY NOT NULL,
      title         TEXT NOT NULL,
      target_amount REAL NOT NULL DEFAULT 0,
      saved_amount  REAL NOT NULL DEFAULT 0,
      deadline      TEXT NOT NULL,
      notes         TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS category_budgets (
      category      TEXT PRIMARY KEY NOT NULL,
      monthly_limit REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS custom_categories (
      key       TEXT PRIMARY KEY NOT NULL,
      label     TEXT NOT NULL,
      icon      TEXT NOT NULL,
      color     TEXT NOT NULL,
      is_income INTEGER NOT NULL DEFAULT 0
    );
  `);
  return _db;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const d = await db();
  const rows = await d.getAllAsync(
    'SELECT * FROM transactions ORDER BY date DESC, rowid DESC'
  );
  return rows.map((r: any) => ({
    id: r.id, title: r.title, amount: r.amount,
    isIncome: r.is_income === 1, category: r.category,
    date: r.date, notes: r.notes,
  }));
}

export async function insertTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
  const d = await db();
  const id = uid();
  await d.runAsync(
    'INSERT INTO transactions (id,title,amount,is_income,category,date,notes) VALUES (?,?,?,?,?,?,?)',
    [id, data.title, data.amount, data.isIncome ? 1 : 0, data.category, data.date, data.notes]
  );
  return { id, ...data };
}

export async function removeTransaction(id: string): Promise<void> {
  const d = await db();
  await d.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

// ── Bills ─────────────────────────────────────────────────────────────────────

export async function fetchBills(): Promise<Bill[]> {
  const d = await db();
  const rows = await d.getAllAsync(
    'SELECT * FROM bills ORDER BY due_date ASC'
  );
  return rows.map((r: any) => ({
    id: r.id, title: r.title, amount: r.amount,
    dueDate: r.due_date, recurrence: r.recurrence,
    isPaid: r.is_paid === 1, notes: r.notes,
    notificationId: r.notification_id,
  }));
}

export async function insertBill(data: Omit<Bill, 'id'>): Promise<Bill> {
  const d = await db();
  const id = uid();
  await d.runAsync(
    'INSERT INTO bills (id,title,amount,due_date,recurrence,is_paid,notes,notification_id) VALUES (?,?,?,?,?,?,?,?)',
    [id, data.title, data.amount, data.dueDate, data.recurrence, 0, data.notes, data.notificationId]
  );
  return { id, ...data };
}

export async function setBillPaid(id: string, isPaid: boolean): Promise<void> {
  const d = await db();
  await d.runAsync('UPDATE bills SET is_paid = ? WHERE id = ?', [isPaid ? 1 : 0, id]);
}

export async function removeBill(id: string): Promise<void> {
  const d = await db();
  await d.runAsync('DELETE FROM bills WHERE id = ?', [id]);
}

// ── Savings Goals ─────────────────────────────────────────────────────────────

export async function fetchGoals(): Promise<SavingsGoal[]> {
  const d = await db();
  const rows = await d.getAllAsync(
    'SELECT * FROM savings_goals ORDER BY deadline ASC'
  );
  return rows.map((r: any) => ({
    id: r.id, title: r.title,
    targetAmount: r.target_amount, savedAmount: r.saved_amount,
    deadline: r.deadline, notes: r.notes,
  }));
}

export async function insertGoal(data: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> {
  const d = await db();
  const id = uid();
  await d.runAsync(
    'INSERT INTO savings_goals (id,title,target_amount,saved_amount,deadline,notes) VALUES (?,?,?,?,?,?)',
    [id, data.title, data.targetAmount, data.savedAmount, data.deadline, data.notes]
  );
  return { id, ...data };
}

export async function updateGoalSaved(id: string, savedAmount: number): Promise<void> {
  const d = await db();
  await d.runAsync('UPDATE savings_goals SET saved_amount = ? WHERE id = ?', [savedAmount, id]);
}

export async function removeGoal(id: string): Promise<void> {
  const d = await db();
  await d.runAsync('DELETE FROM savings_goals WHERE id = ?', [id]);
}

// ── Category Budgets ──────────────────────────────────────────────────────────

export async function fetchBudgets(): Promise<CategoryBudget[]> {
  const d = await db();
  const rows = await d.getAllAsync('SELECT * FROM category_budgets');
  return rows.map((r: any) => ({ category: r.category, monthlyLimit: r.monthly_limit }));
}

export async function upsertBudget(category: string, monthlyLimit: number): Promise<void> {
  const d = await db();
  await d.runAsync(
    'INSERT INTO category_budgets (category, monthly_limit) VALUES (?, ?) ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit',
    [category, monthlyLimit]
  );
}

export async function removeBudget(category: string): Promise<void> {
  const d = await db();
  await d.runAsync('DELETE FROM category_budgets WHERE category = ?', [category]);
}

// ── Custom Categories ─────────────────────────────────────────────────────────

export async function fetchCustomCategories(): Promise<CustomCategory[]> {
  const d = await db();
  const rows = await d.getAllAsync('SELECT * FROM custom_categories');
  return rows.map((r: any) => ({
    key: r.key, label: r.label, icon: r.icon, color: r.color,
    isIncome: r.is_income === 1,
  }));
}

export async function insertCustomCategory(cat: CustomCategory): Promise<void> {
  const d = await db();
  await d.runAsync(
    'INSERT INTO custom_categories (key, label, icon, color, is_income) VALUES (?, ?, ?, ?, ?)',
    [cat.key, cat.label, cat.icon, cat.color, cat.isIncome ? 1 : 0]
  );
}

export async function removeCustomCategory(key: string): Promise<void> {
  const d = await db();
  await d.runAsync('DELETE FROM custom_categories WHERE key = ?', [key]);
}
