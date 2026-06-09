/**
 * Budget periods run from the 10th of one month to the 9th of the next.
 * e.g. Jun 10 – Jul 9, Jul 10 – Aug 9, etc.
 */

export function getBudgetPeriodStart(ref: Date): Date {
  if (ref.getDate() >= 10) {
    return new Date(ref.getFullYear(), ref.getMonth(), 10);
  }
  return new Date(ref.getFullYear(), ref.getMonth() - 1, 10);
}

export function getBudgetPeriodEnd(ref: Date): Date {
  const start = getBudgetPeriodStart(ref);
  // End is exclusive: the 10th of the following month
  return new Date(start.getFullYear(), start.getMonth() + 1, 10);
}

export function inBudgetPeriod(dateStr: string, ref: Date): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  return d >= getBudgetPeriodStart(ref) && d < getBudgetPeriodEnd(ref);
}

export function getBudgetPeriodLabel(ref: Date): string {
  const start = getBudgetPeriodStart(ref);
  const lastDay = new Date(getBudgetPeriodEnd(ref).getTime() - 86400000); // one day before end
  const startStr = start.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  const endStr   = lastDay.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}
