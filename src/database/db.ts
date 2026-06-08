import * as SQLite from 'expo-sqlite';
import { Transaction, Bill, SavingsGoal } from '../types';

let _db: SQLite.SQLiteDatabase | null = null;

async function db(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
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
    `);
  }
  return _db;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const d = await db();
  const rows = await d.getAllAsync<any>(
    'SELECT * FROM transactions ORDER BY date DESC, rowid DESC'
  );
  return rows.map(r => ({
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
  const rows = await d.getAllAsync<any>(
    'SELECT * FROM bills ORDER BY due_date ASC'
  );
  return rows.map(r => ({
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
  const rows = await d.getAllAsync<any>(
    'SELECT * FROM savings_goals ORDER BY deadline ASC'
  );
  return rows.map(r => ({
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
