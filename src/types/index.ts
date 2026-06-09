export interface Transaction {
  id: string;
  title: string;
  amount: number;
  isIncome: boolean;
  category: string;
  date: string; // "YYYY-MM-DD"
  notes: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // "YYYY-MM-DD"
  recurrence: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  isPaid: boolean;
  notes: string;
  notificationId: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string; // "YYYY-MM-DD"
  notes: string;
}

export interface CategoryBudget {
  category: string;
  monthlyLimit: number;
}

export interface CustomCategory {
  key: string;
  label: string;
  icon: string;
  color: string;
  isIncome: boolean;
}
