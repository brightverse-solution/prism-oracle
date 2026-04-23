<script lang="ts">
  import { formatDisplayDate, formatMoney, formatQty } from './lib/quote';
  import type { Company, ComputedLine, QuoteTotals } from './lib/types';

  interface Props {
    company: Company;
    quoteNumber: string;
    quoteDate: Date;
    customer: string;
    items: ComputedLine[];
    totals: QuoteTotals;
  }

  let {
    company,
    quoteNumber,
    quoteDate,
    customer = $bindable(),
    items,
    totals,
  }: Props = $props();

  const vatPercent = $derived(Math.round(totals.vatRate * 100));
</script>

<article class="sheet" aria-label="Quotation preview">
  <!-- Company header -->
  <header class="company">
    <h2 class="company-name">{company.name}</h2>
    {#each company.address as line (line)}
      <div class="company-line">{line}</div>
    {/each}
    {#if company.phone}
      <div class="company-line">Tel: {company.phone}</div>
    {/if}
    {#if company.taxId}
      <div class="company-line">Tax ID: {company.taxId}</div>
    {/if}
  </header>

  <h3 class="qheading">QUOTATION</h3>

  <!-- Quote meta -->
  <dl class="meta">
    <dt>Quote No.</dt>
    <dd>{quoteNumber}</dd>

    <dt>Date</dt>
    <dd>{formatDisplayDate(quoteDate)}</dd>

    <dt>Customer</dt>
    <dd class="customer-cell">
      <input
        class="customer-input"
        type="text"
        bind:value={customer}
        placeholder="— click to add customer name —"
        aria-label="Customer name"
      />
    </dd>
  </dl>

  <!-- Items -->
  <table class="items">
    <thead>
      <tr>
        <th class="col-idx">#</th>
        <th class="col-product">Product</th>
        <th class="col-qty">Qty</th>
        <th class="col-price">Unit Price (THB)</th>
        <th class="col-total">Line Total (THB)</th>
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.index)}
        <tr>
          <td class="col-idx">{item.index}</td>
          <td class="col-product">{item.product}</td>
          <td class="col-qty">{formatQty(item.quantity)}</td>
          <td class="col-price">{formatMoney(item.price)}</td>
          <td class="col-total">{formatMoney(item.lineTotal)}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- Totals -->
  <table class="totals">
    <tbody>
      <tr class="totals-row">
        <td class="totals-label">Subtotal</td>
        <td class="totals-value">{formatMoney(totals.subtotal)}</td>
      </tr>
      <tr class="totals-row">
        <td class="totals-label">VAT {vatPercent}%</td>
        <td class="totals-value">{formatMoney(totals.vat)}</td>
      </tr>
      <tr class="totals-row grand">
        <td class="totals-label">Grand Total</td>
        <td class="totals-value">{formatMoney(totals.grandTotal)}</td>
      </tr>
    </tbody>
  </table>
</article>

<style>
  .sheet {
    background: var(--prism-surface);
    border: 1px solid var(--prism-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04);
    padding: 2.5rem 2.75rem;
    max-width: 820px;
    margin: 0 auto;
    color: var(--prism-ink);
  }

  .company {
    margin-bottom: 1.75rem;
  }

  .company-name {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .company-line {
    font-size: 0.82rem;
    color: var(--prism-muted);
    line-height: 1.4;
  }

  .qheading {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    margin: 0 0 1rem;
  }

  .meta {
    display: grid;
    grid-template-columns: 140px 1fr;
    row-gap: 0.35rem;
    column-gap: 1rem;
    margin: 0 0 1.75rem;
    padding: 0;
  }

  .meta dt {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .meta dd {
    margin: 0;
    font-size: 0.9rem;
  }

  .customer-cell {
    min-width: 0;
  }

  .customer-input {
    width: 100%;
    font: inherit;
    color: inherit;
    background: transparent;
    border: none;
    border-bottom: 1px dashed transparent;
    padding: 2px 4px;
    border-radius: 3px;
    outline: none;
    transition: background-color 0.12s ease, border-color 0.12s ease;
  }

  .customer-input::placeholder {
    color: var(--prism-muted);
    font-style: italic;
  }

  .customer-input:hover {
    background: var(--prism-edit-hover);
    border-bottom-color: var(--prism-border);
  }

  .customer-input:focus {
    background: var(--prism-edit-focus);
    border-bottom-color: var(--prism-accent);
  }

  .items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.25rem;
  }

  .items th,
  .items td {
    border: 1px solid var(--prism-border);
    padding: 0.55rem 0.7rem;
    font-size: 0.88rem;
    vertical-align: middle;
  }

  .items thead th {
    background: var(--prism-header-bg);
    color: var(--prism-header-text);
    font-weight: 700;
    text-align: center;
  }

  .items thead th.col-product {
    text-align: left;
  }

  .items tbody .col-idx {
    text-align: center;
    width: 36px;
  }
  .items tbody .col-product {
    text-align: left;
  }
  .items tbody .col-qty,
  .items tbody .col-price,
  .items tbody .col-total {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .totals {
    width: 100%;
    border-collapse: collapse;
  }

  .totals .totals-row td {
    border: 1px solid var(--prism-border);
    padding: 0.55rem 0.7rem;
    font-weight: 700;
    font-size: 0.9rem;
    background: var(--prism-totals-bg);
  }

  .totals .totals-label {
    text-align: right;
    width: 70%;
  }

  .totals .totals-value {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .totals .grand td {
    background: var(--prism-grand-bg);
    font-size: 0.98rem;
  }
</style>
