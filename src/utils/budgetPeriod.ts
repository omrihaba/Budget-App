/**
 * Budget periods run from the 10th of one month to the 9th of the next.
 * e.g. Jun 10 – Jul 9, Jul 10 – Aug 9, etc.
 */

import { Bill } from '../types';

export function getBudgetPeriodStart(ref: Date): Date {
  if (ref.getDate() >= 10) {
    return new Date(ref.getFullYear(), ref.getMonth(), 10);
  }
  return new Date(ref.getFullYear(), ref.getMonth() - 1, 10);
}

export function getBudgetPeriodEnd(ref: Date): Date {
  const start = getBudgetPeriodStart(ref);
  return new Date(start.getFullYear(), start.getMonth() + 1, 10);
}

export function inBudgetPeriod(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  return d >= getBudgetPeriodStart(ref) && d < getBudgetPeriodEnd(ref);
}

/**
 * Returns true if a bill has an occurrence within the current budget period,
 * taking recurrence into account. Monthly bills always appear once per period.
 */
export function billInBudgetPeriod(bill: Bill, ref: Date): boolean {
  const periodStart = getBudgetPeriodStart(ref);
  const periodEnd   = getBudgetPeriodEnd(ref);
  const due         = new Date(bill.dueDate + 'T00:00:00');

  switch (bill.recurrence) {
    case 'monthly': {
      const dueDay = due.getDate();
      // The period starts on the 10th. Days >= 10 land in the start month,
      // days 1–9 land in the following month — both always inside the period.
      const month = dueDay >= 10 ? periodStart.getMonth() : periodStart.getMonth() + 1;
      const candidate = new Date(periodStart.getFullYear(), month, dueDay);
      return candidate >= periodStart && candidate < periodEnd;
    }
    case 'weekly': {
      // Any day-of-week match within the ~30-day period qualifies.
      const dow = due.getDay();
      const d = new Date(periodStart);
      while (d < periodEnd) {
        if (d.getDay() === dow) return true;
        d.setDate(d.getDate() + 1);
      }
      return false;
    }
    case 'quarterly': {
      // Step forward in 3-month increments from the original due date.
      const candidate = new Date(due);
      while (candidate < periodStart) candidate.setMonth(candidate.getMonth() + 3);
      return candidate >= periodStart && candidate < periodEnd;
    }
    case 'yearly': {
      // Check same day/month in each year that overlaps the period.
      for (let y = periodStart.getFullYear(); y <= periodEnd.getFullYear(); y++) {
        const candidate = new Date(y, due.getMonth(), due.getDate());
        if (candidate >= periodStart && candidate < periodEnd) return true;
      }
      return false;
    }
    default:
      return due >= periodStart && due < periodEnd;
  }
}

export function getPreviousBudgetPeriods(ref: Date, count: number): Array<{ start: Date; end: Date; label: string }> {
  const currentStart = getBudgetPeriodStart(ref);
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(currentStart.getFullYear(), currentStart.getMonth() - (count - 1 - i), 10);
    const end   = new Date(start.getFullYear(), start.getMonth() + 1, 10);
    const label = start.toLocaleDateString('default', { month: 'short' });
    return { start, end, label };
  });
}

export function getBudgetPeriodLabel(ref: Date): string {
  const start   = getBudgetPeriodStart(ref);
  const lastDay = new Date(getBudgetPeriodEnd(ref).getTime() - 86400000);
  const startStr = start.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  const endStr   = lastDay.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}
