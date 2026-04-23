import { describe, expect, it } from 'bun:test';
import { CsvParseError, parseCsv } from '../src/lib/csv';

describe('parseCsv', () => {
  it('parses a valid CSV with all required columns', () => {
    const csv = `product,quantity,price
Apple,10,150
Banana,5,300
Cherry,8,2500`;
    const items = parseCsv(csv);
    expect(items).toEqual([
      { product: 'Apple', quantity: 10, price: 150 },
      { product: 'Banana', quantity: 5, price: 300 },
      { product: 'Cherry', quantity: 8, price: 2500 },
    ]);
  });

  it('accepts case-insensitive headers with whitespace', () => {
    const csv = `Product , Quantity , PRICE
Apple,1,100`;
    const items = parseCsv(csv);
    expect(items).toEqual([{ product: 'Apple', quantity: 1, price: 100 }]);
  });

  it('accepts fractional quantities', () => {
    const csv = `product,quantity,price
Consulting hour,1.5,2000`;
    const items = parseCsv(csv);
    expect(items).toEqual([{ product: 'Consulting hour', quantity: 1.5, price: 2000 }]);
  });

  it('throws on empty CSV', () => {
    expect(() => parseCsv('')).toThrow(CsvParseError);
    expect(() => parseCsv('   \n\n  ')).toThrow(CsvParseError);
  });

  it('throws on headers only with no data', () => {
    expect(() => parseCsv('product,quantity,price')).toThrow(CsvParseError);
    expect(() => parseCsv('product,quantity,price\n')).toThrow(CsvParseError);
  });

  it('throws on missing required column', () => {
    const csv = `product,quantity
Apple,10`;
    expect(() => parseCsv(csv)).toThrow(/Missing required columns/);
  });

  it('throws on blank product', () => {
    const csv = `product,quantity,price
   ,10,150`;
    expect(() => parseCsv(csv)).toThrow(/Row 2: product is required/);
  });

  it('throws on non-numeric quantity', () => {
    const csv = `product,quantity,price
Apple,abc,150`;
    expect(() => parseCsv(csv)).toThrow(/Row 2: quantity must be a positive number/);
  });

  it('throws on zero or negative quantity', () => {
    const csv = `product,quantity,price
Apple,0,150`;
    expect(() => parseCsv(csv)).toThrow(/quantity must be a positive number/);
  });

  it('throws on negative price', () => {
    const csv = `product,quantity,price
Apple,10,-5`;
    expect(() => parseCsv(csv)).toThrow(/price must be a non-negative number/);
  });

  it('accepts zero price (e.g. complimentary)', () => {
    const csv = `product,quantity,price
Welcome gift,1,0`;
    const items = parseCsv(csv);
    expect(items).toEqual([{ product: 'Welcome gift', quantity: 1, price: 0 }]);
  });
});
