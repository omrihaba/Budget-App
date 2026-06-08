import { Ionicons } from '@expo/vector-icons';

export interface Category {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isIncome: boolean;
}

export const CATEGORIES: Category[] = [
  // Expenses
  { key: 'food',          label: 'Food',          icon: 'restaurant',          color: '#FF9500', isIncome: false },
  { key: 'transport',     label: 'Transport',     icon: 'car',                 color: '#007AFF', isIncome: false },
  { key: 'rent',          label: 'Rent',          icon: 'home',                color: '#A2845E', isIncome: false },
  { key: 'utilities',     label: 'Utilities',     icon: 'flash',               color: '#FFD60A', isIncome: false },
  { key: 'entertainment', label: 'Entertainment', icon: 'tv',                  color: '#BF5AF2', isIncome: false },
  { key: 'health',        label: 'Health',        icon: 'heart',               color: '#FF3B30', isIncome: false },
  { key: 'shopping',      label: 'Shopping',      icon: 'bag',                 color: '#FF2D55', isIncome: false },
  { key: 'education',     label: 'Education',     icon: 'book',                color: '#30D158', isIncome: false },
  // Income
  { key: 'salary',        label: 'Salary',        icon: 'briefcase',           color: '#32ADE6', isIncome: true  },
  { key: 'freelance',     label: 'Freelance',     icon: 'laptop-outline',      color: '#30D158', isIncome: true  },
  { key: 'investment',    label: 'Investment',    icon: 'trending-up',         color: '#5856D6', isIncome: true  },
  { key: 'gift',          label: 'Gift',          icon: 'gift',                color: '#00C7BE', isIncome: true  },
  // Both
  { key: 'other',         label: 'Other',         icon: 'ellipsis-horizontal', color: '#8E8E93', isIncome: false },
];

export function getCategoryByKey(key: string): Category {
  return CATEGORIES.find(c => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const EXPENSE_CATEGORIES: Category[] = [
  ...CATEGORIES.filter(c => !c.isIncome),
];

export const INCOME_CATEGORIES: Category[] = [
  ...CATEGORIES.filter(c => c.isIncome),
  CATEGORIES.find(c => c.key === 'other')!,
];
