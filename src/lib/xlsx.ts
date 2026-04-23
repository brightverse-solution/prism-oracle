import ExcelJS from 'exceljs';
import { formatDisplayDate } from './quote';
import type { Quote } from './types';

const COLOR = {
  headerBg: 'FF1F2937',
  headerText: 'FFFFFFFF',
  totalsBg: 'FFF3F4F6',
  grandTotalBg: 'FFD1D5DB',
  border: 'FFD1D5DB',
} as const;

const NUM_FMT = {
  qty: '#,##0.##',
  money: '#,##0.00',
} as const;

const thinBorder: ExcelJS.Borders = {
  top: { style: 'thin', color: { argb: COLOR.border } },
  left: { style: 'thin', color: { argb: COLOR.border } },
  bottom: { style: 'thin', color: { argb: COLOR.border } },
  right: { style: 'thin', color: { argb: COLOR.border } },
  diagonal: { style: 'thin', color: { argb: COLOR.border } },
};

const SHEET_NAME = 'Quotation';
const HEADER_SENTINEL = '#';
const LABEL_SUBTOTAL = 'Subtotal';
const LABEL_VAT_PREFIX = 'VAT';
const LABEL_GRAND_TOTAL = 'Grand Total';

/**
 * Build an xlsx workbook for a Quote. Returns a buffer that can be written
 * to disk (node) or turned into a Blob for download (browser).
 *
 * This function is a faithful port of FORGE's `writeQuoteXlsx`. Format is
 * intentionally pinned to FORGE's output so the download round-trips cleanly
 * against FORGE's `readQuoteXlsx` round-trip helper. The visual contract is
 * the canonical 24,610 THB math — if PRISM's output drifts from FORGE's,
 * tests catch it.
 */
export async function generateQuoteXlsxBuffer(quote: Quote): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'PRISM Oracle';
  wb.created = new Date();

  const ws = wb.addWorksheet(SHEET_NAME, {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    },
  });

  ws.columns = [
    { width: 6 },
    { width: 42 },
    { width: 12 },
    { width: 18 },
    { width: 20 },
  ];

  let row = 1;

  const nameCell = ws.getCell(row, 1);
  nameCell.value = quote.company.name;
  nameCell.font = { bold: true, size: 18 };
  ws.mergeCells(row, 1, row, 5);
  row++;

  for (const line of quote.company.address) {
    ws.getCell(row, 1).value = line;
    ws.getCell(row, 1).font = { size: 10 };
    ws.mergeCells(row, 1, row, 5);
    row++;
  }
  if (quote.company.phone) {
    ws.getCell(row, 1).value = `Tel: ${quote.company.phone}`;
    ws.getCell(row, 1).font = { size: 10 };
    ws.mergeCells(row, 1, row, 5);
    row++;
  }
  if (quote.company.taxId) {
    ws.getCell(row, 1).value = `Tax ID: ${quote.company.taxId}`;
    ws.getCell(row, 1).font = { size: 10 };
    ws.mergeCells(row, 1, row, 5);
    row++;
  }

  row++;

  ws.getCell(row, 1).value = 'QUOTATION';
  ws.getCell(row, 1).font = { bold: true, size: 14 };
  ws.mergeCells(row, 1, row, 5);
  row++;

  const writeMetaRow = (label: string, value: string, mergeValue = false) => {
    ws.getCell(row, 1).value = label;
    ws.getCell(row, 1).font = { bold: true };
    ws.getCell(row, 2).value = value;
    if (mergeValue) ws.mergeCells(row, 2, row, 5);
    row++;
  };
  writeMetaRow('Quote No.', quote.quoteNumber);
  writeMetaRow('Date', formatDisplayDate(quote.date));
  writeMetaRow('Customer', quote.customer ?? '_______________________', true);

  row++;

  const headers = [HEADER_SENTINEL, 'Product', 'Qty', 'Unit Price (THB)', 'Line Total (THB)'];
  headers.forEach((h, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: COLOR.headerText } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLOR.headerBg },
    };
    cell.alignment = {
      horizontal: i === 1 ? 'left' : 'center',
      vertical: 'middle',
    };
    cell.border = thinBorder;
  });
  ws.getRow(row).height = 22;
  row++;

  for (const item of quote.items) {
    const cells = [
      { col: 1, value: item.index, align: 'center' as const },
      { col: 2, value: item.product, align: 'left' as const },
      { col: 3, value: item.quantity, align: 'right' as const, fmt: NUM_FMT.qty },
      { col: 4, value: item.price, align: 'right' as const, fmt: NUM_FMT.money },
      { col: 5, value: item.lineTotal, align: 'right' as const, fmt: NUM_FMT.money },
    ];
    for (const c of cells) {
      const cell = ws.getCell(row, c.col);
      cell.value = c.value;
      cell.alignment = { horizontal: c.align, vertical: 'middle' };
      if (c.fmt) cell.numFmt = c.fmt;
      cell.border = thinBorder;
    }
    row++;
  }

  row++;

  const writeTotalRow = (label: string, value: number, grand = false) => {
    const bg = grand ? COLOR.grandTotalBg : COLOR.totalsBg;
    ws.mergeCells(row, 1, row, 3);
    const labelCell = ws.getCell(row, 4);
    labelCell.value = label;
    labelCell.font = { bold: true, size: grand ? 12 : 11 };
    labelCell.alignment = { horizontal: 'right', vertical: 'middle' };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    labelCell.border = thinBorder;

    const valCell = ws.getCell(row, 5);
    valCell.value = value;
    valCell.numFmt = NUM_FMT.money;
    valCell.font = { bold: true, size: grand ? 12 : 11 };
    valCell.alignment = { horizontal: 'right', vertical: 'middle' };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    valCell.border = thinBorder;
    row++;
  };

  writeTotalRow(LABEL_SUBTOTAL, quote.totals.subtotal);
  writeTotalRow(`${LABEL_VAT_PREFIX} ${Math.round(quote.totals.vatRate * 100)}%`, quote.totals.vat);
  writeTotalRow(LABEL_GRAND_TOTAL, quote.totals.grandTotal, true);

  const buf = await wb.xlsx.writeBuffer();
  return buf as ArrayBuffer;
}

/** Browser-only: trigger a download of the xlsx buffer. */
export function downloadXlsx(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Read-back helper for tests — mirrors FORGE's `readQuoteXlsx` but takes a buffer. */
export interface ReadQuote {
  quoteNumber: string | null;
  customer: string | null;
  items: Array<{ product: string; quantity: number; price: number; lineTotal: number }>;
  totals: { subtotal: number; vat: number; grandTotal: number };
}

export async function readQuoteXlsxFromBuffer(buffer: ArrayBuffer): Promise<ReadQuote> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.getWorksheet(SHEET_NAME);
  if (!ws) throw new Error(`Sheet "${SHEET_NAME}" not found`);

  let quoteNumber: string | null = null;
  let customer: string | null = null;
  let headerRow = -1;

  ws.eachRow((r, rowNumber) => {
    const first = r.getCell(1).value;
    const second = r.getCell(2).value;
    if (first === 'Quote No.' && typeof second === 'string') quoteNumber = second;
    if (first === 'Customer' && typeof second === 'string') {
      customer = second.startsWith('___') ? null : second;
    }
    if (first === HEADER_SENTINEL && headerRow < 0) headerRow = rowNumber;
  });

  if (headerRow < 0) throw new Error('Item table header not found');

  const items: ReadQuote['items'] = [];
  let r = headerRow + 1;
  while (true) {
    const idx = ws.getCell(r, 1).value;
    if (typeof idx !== 'number') break;
    items.push({
      product: String(ws.getCell(r, 2).value ?? ''),
      quantity: Number(ws.getCell(r, 3).value),
      price: Number(ws.getCell(r, 4).value),
      lineTotal: Number(ws.getCell(r, 5).value),
    });
    r++;
  }

  let subtotal = 0;
  let vat = 0;
  let grandTotal = 0;
  ws.eachRow((rowObj) => {
    const label = rowObj.getCell(4).value;
    const val = rowObj.getCell(5).value;
    if (typeof label !== 'string' || typeof val !== 'number') return;
    if (label === LABEL_SUBTOTAL) subtotal = val;
    else if (label.startsWith(LABEL_VAT_PREFIX)) vat = val;
    else if (label === LABEL_GRAND_TOTAL) grandTotal = val;
  });

  return {
    quoteNumber,
    customer,
    items,
    totals: { subtotal, vat, grandTotal },
  };
}
