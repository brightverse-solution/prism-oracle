import type { ComputedLine, LineItem, QuoteTotals } from './types';

export const VAT_RATE = 0.07;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeLines(items: LineItem[]): ComputedLine[] {
  return items.map((item, i) => ({
    ...item,
    index: i + 1,
    lineTotal: round2(item.quantity * item.price),
  }));
}

export function computeTotals(lines: ComputedLine[]): QuoteTotals {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
  const vat = round2(subtotal * VAT_RATE);
  const grandTotal = round2(subtotal + vat);
  return { subtotal, vat, vatRate: VAT_RATE, grandTotal };
}

export function formatDateKey(date: Date, tz = 'Asia/Bangkok'): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const m = parts.find((p) => p.type === 'month')?.value ?? '00';
  const d = parts.find((p) => p.type === 'day')?.value ?? '00';
  return `${y}${m}${d}`;
}

export function formatDisplayDate(date: Date, tz = 'Asia/Bangkok'): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatMoney(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatQty(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
