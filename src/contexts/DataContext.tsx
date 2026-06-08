import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Transaction, Bill, SavingsGoal } from '../types';
import * as db from '../database/db';
import { cancelReminder } from '../utils/notifications';

interface DataContextValue {
  transactions: Transaction[];
  bills: Bill[];
  goals: SavingsGoal[];
  isLoading: boolean;
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addBill: (data: Omit<Bill, 'id'>) => Promise<void>;
  toggleBillPaid: (id: string, isPaid: boolean) => Promise<void>;
  deleteBill: (id: string, notificationId: string) => Promise<void>;
  addGoal: (data: Omit<SavingsGoal, 'id'>) => Promise<void>;
  addFunds: (id: string, amount: number, current: number, target: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const Ctx = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills]               = useState<Bill[]>([]);
  const [goals, setGoals]               = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [txs, bs, gs] = await Promise.all([
          db.fetchTransactions(),
          db.fetchBills(),
          db.fetchGoals(),
        ]);
        setTransactions(txs);
        setBills(bs);
        setGoals(gs);
      } catch (e) {
        // expo-sqlite is not available in browser (web preview) — show empty state
        console.warn('DB unavailable (web only):', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id'>) => {
    try {
      const tx = await db.insertTransaction(data);
      setTransactions(prev => [tx, ...prev]);
    } catch {
      // web: update state only (in-memory)
      const tx = { id: Date.now().toString(36), ...data };
      setTransactions(prev => [tx, ...prev]);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try { await db.removeTransaction(id); } catch {}
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addBill = useCallback(async (data: Omit<Bill, 'id'>) => {
    try {
      const bill = await db.insertBill(data);
      setBills(prev => [...prev, bill].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
    } catch {
      const bill = { id: Date.now().toString(36), ...data };
      setBills(prev => [...prev, bill].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
    }
  }, []);

  const toggleBillPaid = useCallback(async (id: string, isPaid: boolean) => {
    try { await db.setBillPaid(id, isPaid); } catch {}
    setBills(prev => prev.map(b => (b.id === id ? { ...b, isPaid } : b)));
  }, []);

  const deleteBill = useCallback(async (id: string, notificationId: string) => {
    try { await cancelReminder(notificationId); await db.removeBill(id); } catch {}
    setBills(prev => prev.filter(b => b.id !== id));
  }, []);

  const addGoal = useCallback(async (data: Omit<SavingsGoal, 'id'>) => {
    try {
      const goal = await db.insertGoal(data);
      setGoals(prev => [...prev, goal].sort((a, b) => a.deadline.localeCompare(b.deadline)));
    } catch {
      const goal = { id: Date.now().toString(36), ...data };
      setGoals(prev => [...prev, goal].sort((a, b) => a.deadline.localeCompare(b.deadline)));
    }
  }, []);

  const addFunds = useCallback(async (id: string, amount: number, current: number, target: number) => {
    const newSaved = Math.min(current + amount, target);
    try { await db.updateGoalSaved(id, newSaved); } catch {}
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, savedAmount: newSaved } : g)));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try { await db.removeGoal(id); } catch {}
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{
      transactions, bills, goals, isLoading,
      addTransaction, deleteTransaction,
      addBill, toggleBillPaid, deleteBill,
      addGoal, addFunds, deleteGoal,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
