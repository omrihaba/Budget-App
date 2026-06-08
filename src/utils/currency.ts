export function formatILS(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return '₪' + formatted;
}

export function parseAmount(text: string): number {
  const cleaned = text.replace(',', '.').replace(/[^\d.]/g, '');
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value;
}
