import { describe, expect, it } from 'bun:test';
import {
  VAT_RATE,
  computeLines,
  computeTotals,
  formatDateKey,
  formatDisplayDate,
} from '../src/lib/quote';
import type { LineItem } from '../src/lib/types';

describe('quote math — canonical contract with FORGE', () => {
  it('computes the canonical 24,610.00 THB quote', () => {
    const items: LineItem[] = [
      { product: 'Alpha', quantity: 10, price: 150 },
      { product: 'Beta', quantity: 5, price: 300 },
      { product: 'Gamma', quantity: 8, price: 2500 },
    ];
    const lines = computeLines(items);
    const totals = computeTotals(lines);

    expect(lines.map((l) => l.lineTotal)).toEqual([1500, 1500, 20000]);
    expect(totals.subtotal).toBe(23000);
    expect(totals.vat).toBe(1610);
    expect(totals.grandTotal).toBe(24610);
    expect(totals.vatRate).toBe(VAT_RATE);
  });
});

describe('computeLines', () => {
  it('assigns sequential 1-indexed line indexes', () => {
    const items: LineItem[] = [
      { product: 'A', quantity: 1, price: 1 },
      { product: 'B', quantity: 1, price: 1 },
      { product: 'C', quantity: 1, price: 1 },
    ];
    const lines = computeLines(items);
    expect(lines.map((l) => l.index)).toEqual([1, 2, 3]);
  });

  it('rounds line totals to 2 decimals', () => {
    const items: LineItem[] = [{ product: 'A', quantity: 1.333, price: 0.1 }];
    const lines = computeLines(items);
    expect(lines[0]?.lineTotal).toBe(0.13);
  });

  it('handles fractional quantities (e.g. 1.5 hours)', () => {
    const items: LineItem[] = [{ product: 'Consulting', quantity: 1.5, price: 2000 }];
    const lines = computeLines(items);
    const totals = computeTotals(lines);
    expect(lines[0]?.lineTotal).toBe(3000);
    expect(totals.subtotal).toBe(3000);
    expect(totals.vat).toBe(210);
    expect(totals.grandTotal).toBe(3210);
  });

  it('returns empty list for empty input', () => {
    expect(computeLines([])).toEqual([]);
  });
});

describe('computeTotals', () => {
  it('returns zero totals for empty lines', () => {
    const totals = computeTotals([]);
    expect(totals.subtotal).toBe(0);
    expect(totals.vat).toBe(0);
    expect(totals.grandTotal).toBe(0);
  });

  it('handles single item', () => {
    const lines = computeLines([{ product: 'Solo', quantity: 1, price: 100 }]);
    const totals = computeTotals(lines);
    expect(totals.subtotal).toBe(100);
    expect(totals.vat).toBe(7);
    expect(totals.grandTotal).toBe(107);
  });
});

describe('formatDateKey', () => {
  it('formats YYYYMMDD in Asia/Bangkok', () => {
    const d = new Date('2026-04-23T10:00:00+07:00');
    expect(formatDateKey(d)).toBe('20260423');
  });

  it('respects timezone boundary (near midnight UTC)', () => {
    const d = new Date('2026-04-22T18:00:00Z'); // 2026-04-23 01:00 in Bangkok
    expect(formatDateKey(d)).toBe('20260423');
  });
});

describe('formatDisplayDate', () => {
  it('formats as long-form date in Asia/Bangkok', () => {
    const d = new Date('2026-04-23T10:00:00+07:00');
    expect(formatDisplayDate(d)).toBe('23 April 2026');
  });
});
