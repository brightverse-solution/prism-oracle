import { describe, expect, it } from 'bun:test';
import { computeLines, computeTotals } from '../src/lib/quote';
import type { Quote } from '../src/lib/types';
import { generateQuoteXlsxBuffer, readQuoteXlsxFromBuffer } from '../src/lib/xlsx';

function canonicalQuote(customer: string | null): Quote {
  const items = [
    { product: 'Alpha', quantity: 10, price: 150 },
    { product: 'Beta', quantity: 5, price: 300 },
    { product: 'Gamma', quantity: 8, price: 2500 },
  ];
  const lines = computeLines(items);
  const totals = computeTotals(lines);
  return {
    quoteNumber: 'Q-20260423-001',
    date: new Date('2026-04-23T10:00:00+07:00'),
    customer,
    company: {
      name: 'Brightverse Solution Co., Ltd.',
      address: ['123 Example Road', 'Khlong Toei, Bangkok 10110', 'Thailand'],
      phone: '+66-2-xxx-xxxx',
      taxId: '0-0000-00000-00-0',
    },
    items: lines,
    totals,
  };
}

describe('xlsx round-trip — canonical contract with FORGE', () => {
  it('generates an xlsx whose round-trip totals match 24,610', async () => {
    const quote = canonicalQuote('Acme Co., Ltd.');
    const buf = await generateQuoteXlsxBuffer(quote);
    const read = await readQuoteXlsxFromBuffer(buf);

    expect(read.quoteNumber).toBe('Q-20260423-001');
    expect(read.customer).toBe('Acme Co., Ltd.');
    expect(read.items).toHaveLength(3);
    expect(read.totals).toEqual({ subtotal: 23000, vat: 1610, grandTotal: 24610 });
  });

  it('preserves the inline customer edit in the xlsx', async () => {
    const quote = canonicalQuote('Inline Edited Customer Ltd.');
    const buf = await generateQuoteXlsxBuffer(quote);
    const read = await readQuoteXlsxFromBuffer(buf);
    expect(read.customer).toBe('Inline Edited Customer Ltd.');
  });

  it('writes null customer as the placeholder (not the word "null")', async () => {
    const quote = canonicalQuote(null);
    const buf = await generateQuoteXlsxBuffer(quote);
    const read = await readQuoteXlsxFromBuffer(buf);
    expect(read.customer).toBeNull();
  });

  it('preserves line item data', async () => {
    const quote = canonicalQuote('Test');
    const buf = await generateQuoteXlsxBuffer(quote);
    const read = await readQuoteXlsxFromBuffer(buf);
    expect(read.items).toEqual([
      { product: 'Alpha', quantity: 10, price: 150, lineTotal: 1500 },
      { product: 'Beta', quantity: 5, price: 300, lineTotal: 1500 },
      { product: 'Gamma', quantity: 8, price: 2500, lineTotal: 20000 },
    ]);
  });
});
