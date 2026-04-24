import { describe, expect, it } from 'bun:test';
import fixtureData from '../examples/fixture.json';

// Validates that FORGE's fixture matches the cross-Oracle canonical contract.
// If FORGE's numbers drift, this test breaks here — not silently in the UI.
describe('FORGE fixture', () => {
  it('matches the canonical 24,610 THB grand total', () => {
    expect(fixtureData.totals.grandTotal).toBe(24610);
  });

  it('has correct subtotal and VAT', () => {
    expect(fixtureData.totals.subtotal).toBe(23000);
    expect(fixtureData.totals.vatRate).toBe(0.07);
    expect(fixtureData.totals.vat).toBe(1610);
  });

  it('has 3 line items', () => {
    expect(fixtureData.items).toHaveLength(3);
  });

  it('quote number matches Q-YYYYMMDD-NNN format', () => {
    expect(fixtureData.quoteNumber).toMatch(/^Q-\d{8}-\d{3}$/);
  });

  it('all lineTotals match round2(quantity × price)', () => {
    for (const item of fixtureData.items) {
      const expected = Math.round(item.quantity * item.price * 100) / 100;
      expect(item.lineTotal).toBe(expected);
    }
  });

  it('subtotal equals sum of lineTotals', () => {
    const sum = fixtureData.items.reduce((acc, item) => acc + item.lineTotal, 0);
    expect(sum).toBe(fixtureData.totals.subtotal);
  });
});
