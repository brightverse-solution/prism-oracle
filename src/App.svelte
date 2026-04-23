<script lang="ts">
  import Quotation from './Quotation.svelte';
  import { loadConfig } from './lib/config';
  import { CsvParseError, parseCsv } from './lib/csv';
  import { computeLines, computeTotals } from './lib/quote';
  import { createBrowserCounter } from './lib/quote-number';
  import type { ComputedLine, Quote, QuoteTotals } from './lib/types';
  import { downloadXlsx, generateQuoteXlsxBuffer } from './lib/xlsx';

  const config = loadConfig();
  const counter = createBrowserCounter();

  let lines: ComputedLine[] = $state([]);
  let quoteNumber: string = $state('');
  let quoteDate: Date = $state(new Date());
  let customer: string = $state('');
  let errorMessage: string | null = $state(null);
  let isDragging: boolean = $state(false);
  let isDownloading: boolean = $state(false);

  const totals: QuoteTotals | null = $derived(lines.length > 0 ? computeTotals(lines) : null);

  function resetState() {
    lines = [];
    quoteNumber = '';
    customer = '';
    errorMessage = null;
  }

  async function loadFile(file: File) {
    try {
      errorMessage = null;
      const text = await file.text();
      const items = parseCsv(text);
      const now = new Date();
      lines = computeLines(items);
      quoteNumber = counter.next(now);
      quoteDate = now;
    } catch (e) {
      errorMessage = e instanceof CsvParseError ? e.message : `Unexpected error: ${String(e)}`;
      lines = [];
      quoteNumber = '';
    }
  }

  function onFileInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void loadFile(file);
    input.value = '';
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) void loadFile(file);
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function onDragLeave() {
    isDragging = false;
  }

  async function onDownload() {
    if (!totals || lines.length === 0) return;
    isDownloading = true;
    try {
      const quote: Quote = {
        quoteNumber,
        date: quoteDate,
        customer: customer.trim() || null,
        company: config.company,
        items: lines,
        totals,
      };
      const buf = await generateQuoteXlsxBuffer(quote);
      downloadXlsx(buf, `${quoteNumber}.xlsx`);
    } catch (e) {
      errorMessage = `Download failed: ${String(e)}`;
    } finally {
      isDownloading = false;
    }
  }
</script>

<header class="topbar">
  <div class="brand">
    <span class="emoji" aria-hidden="true">🎨</span>
    <div class="brand-text">
      <h1>PRISM <span class="brand-sub">Quotation Preview</span></h1>
      <p class="tagline">Light enters whole. Spectrum leaves visible.</p>
    </div>
  </div>
  {#if lines.length > 0}
    <div class="actions">
      <button class="secondary" type="button" onclick={resetState}>Clear</button>
      <button
        class="primary"
        type="button"
        onclick={onDownload}
        disabled={isDownloading || !totals}
      >
        {isDownloading ? 'Building xlsx…' : 'Download xlsx'}
      </button>
    </div>
  {/if}
</header>

<main class="page">
  {#if errorMessage}
    <div class="error" role="alert">
      <strong>CSV error:</strong>
      {errorMessage}
    </div>
  {/if}

  {#if lines.length === 0}
    <section
      class="dropzone"
      class:dragging={isDragging}
      ondrop={onDrop}
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      aria-label="CSV upload"
    >
      <div class="dropzone-inner">
        <div class="dropzone-emoji" aria-hidden="true">🎨</div>
        <h2>Drop a CSV here</h2>
        <p class="dropzone-hint">
          Columns required: <code>product</code>, <code>quantity</code>, <code>price</code>
        </p>
        <label class="filebtn">
          <input type="file" accept=".csv,text/csv" onchange={onFileInput} />
          <span>or choose a file</span>
        </label>
        <p class="dropzone-sample">
          Canonical sample in <code>examples/input.csv</code> — expects grand total 24,610.00 THB.
        </p>
      </div>
    </section>
  {:else if totals}
    <Quotation
      company={config.company}
      {quoteNumber}
      quoteDate={quoteDate}
      bind:customer
      items={lines}
      {totals}
    />
  {/if}
</main>

<style>
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--prism-surface);
    border-bottom: 1px solid var(--prism-border);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .emoji {
    font-size: 1.8rem;
    line-height: 1;
  }

  .brand-text h1 {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .brand-sub {
    font-weight: 500;
    color: var(--prism-muted);
    letter-spacing: 0;
    margin-left: 0.25rem;
  }

  .tagline {
    font-size: 0.75rem;
    color: var(--prism-muted);
    margin: 0;
    font-style: italic;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .primary,
  .secondary {
    padding: 0.55rem 1.1rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color 0.15s ease;
  }

  .primary {
    background: var(--prism-header-bg);
    color: var(--prism-header-text);
  }
  .primary:hover:not(:disabled) {
    background: #0f172a;
  }
  .primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .secondary {
    background: var(--prism-surface);
    color: var(--prism-ink);
    border-color: var(--prism-border);
  }
  .secondary:hover {
    background: var(--prism-totals-bg);
  }

  .page {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1.5rem 4rem;
  }

  .error {
    background: var(--prism-error-bg);
    color: var(--prism-error-text);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .dropzone {
    border: 2px dashed var(--prism-border);
    border-radius: 12px;
    background: var(--prism-surface);
    padding: 3rem 1.5rem;
    text-align: center;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .dropzone.dragging {
    border-color: var(--prism-accent);
    background: var(--prism-edit-hover);
  }

  .dropzone-inner {
    max-width: 480px;
    margin: 0 auto;
  }

  .dropzone-emoji {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    opacity: 0.9;
  }

  .dropzone h2 {
    font-size: 1.2rem;
    margin: 0 0 0.5rem;
  }

  .dropzone-hint {
    color: var(--prism-muted);
    margin: 0 0 1.25rem;
    font-size: 0.9rem;
  }

  .dropzone-hint code {
    background: var(--prism-totals-bg);
    padding: 0.05rem 0.35rem;
    border-radius: 3px;
    font-size: 0.85em;
  }

  .filebtn {
    display: inline-block;
    background: var(--prism-header-bg);
    color: var(--prism-header-text);
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .filebtn:hover {
    background: #0f172a;
  }

  .filebtn input {
    display: none;
  }

  .dropzone-sample {
    margin-top: 1.5rem;
    font-size: 0.75rem;
    color: var(--prism-muted);
  }

  .dropzone-sample code {
    background: var(--prism-totals-bg);
    padding: 0.05rem 0.35rem;
    border-radius: 3px;
  }
</style>
