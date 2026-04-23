# Quotation Preview

Browser UI: drag a CSV of line items, get a professional quotation preview with inline customer-name editing, download a `.xlsx` that matches [FORGE's](https://github.com/brightverse-solution/forge-oracle) output format.

**Status**: v1 · shipped 2026-04-23
**Entry point**: `bun run dev` (from repo root) → http://localhost:5173

---

## Install

Requires [Bun](https://bun.com) `>= 1.1.0`.

```bash
git clone https://github.com/brightverse-solution/prism-oracle.git
cd prism-oracle
bun install
```

## Configure

Company details are bundled via `config.example.json` at the tool root. For v1 the bundled Brightverse Solution placeholder ships as the live config (same company context as FORGE). Edit it in place to change:

```json
{
  "company": {
    "name": "Your Company Co., Ltd.",
    "address": ["123 Example St", "District, Bangkok 10000", "Thailand"],
    "phone": "+66-2-xxx-xxxx",
    "taxId": "0-0000-00000-00-0"
  }
}
```

`phone` and `taxId` are optional; `name` and `address` (non-empty array) are required.

*v2 consideration*: runtime config upload (pick a JSON file in the UI) — not needed until a second company is quoted from the same browser.

## Use

```bash
bun run dev       # http://localhost:5173
bun run build     # static output at tools/quote-preview/dist/
bun run preview   # serve the build locally
```

On the page:

1. **Drop a CSV** onto the dropzone (or click "choose a file").
2. **Preview appears** — company header, auto-generated quote number (`Q-YYYYMMDD-NNN`), today's date (Asia/Bangkok), empty customer field, line items, totals.
3. **Click the customer field** and type the buyer's name — hover shows a subtle yellow hint, focus shows an amber underline. The change flows straight into the downloaded xlsx.
4. **Click "Download xlsx"** — saves as `Q-YYYYMMDD-NNN.xlsx`. Open in Excel / Numbers / Google Sheets — styled identically to FORGE's output.

### Input CSV shape

UTF-8, with a header row. Columns: `product`, `quantity`, `price` — identical to FORGE's contract.

```csv
product,quantity,price
Widget A,10,150.00
Widget B,5,300.00
Consulting (hours),1.5,2500.00
```

- `product`: non-empty string
- `quantity`: positive number (fractional OK — e.g. `1.5` hours)
- `price`: non-negative number, per-unit, in THB

Headers are case-insensitive. Quoted fields are supported (`"Widget, Deluxe"` stays a single product name). See [`examples/input.csv`](examples/input.csv) — canonical sample that produces grand total 24,610.00 THB.

### Output xlsx

Matches FORGE's quotation format:

- Company header (name, address, phone, tax ID)
- Quote block: quote number, date (Asia/Bangkok), customer
- Line items table: `#`, Product, Qty, Unit Price (THB), Line Total (THB)
- Totals: Subtotal, VAT 7%, Grand Total
- Same palette — slate-800 header, gray-100 totals row, gray-300 grand total, thin gray-300 borders

### Quote numbering

`Q-YYYYMMDD-NNN` — a per-day counter. First quote of each day starts at `001`, counter resets at Bangkok midnight.

State is persisted in `localStorage` under the key `prism-oracle.quote-counter`. This is intentionally browser-local — FORGE's CLI counter is file-backed at `~/.forge-oracle/quote-counter.json`. Two counters, same `Q-YYYYMMDD-NNN` format. If the same day is used in both tools, the numbers will collide — teach Palm to pick one source-of-truth per day.

## Tests

From the repo root:

```bash
bun test            # unit + round-trip tests (25 tests)
bun run typecheck   # svelte-check, strict TypeScript
bun run lint        # biome check
```

Coverage:

- **Quote math** (`quote.test.ts`) — canonical 24,610 THB, fractional quantities, rounding, empty/single-item, timezone boundaries
- **CSV parsing** (`csv.test.ts`) — headers, whitespace, validation errors, edge cases
- **XLSX round-trip** (`xlsx-roundtrip.test.ts`) — write → read → totals and customer preserved

The canonical 24,610 THB value is the **contract with FORGE**. If PRISM's math ever drifts from FORGE's, round-trip tests break the build.

## Source layout

```
tools/quote-preview/
  index.html            # Vite entry
  vite.config.ts
  svelte.config.js
  config.example.json   # company details (bundled at build time)
  src/
    main.ts             # Svelte mount
    App.svelte          # upload + preview + download orchestration
    Quotation.svelte    # the quotation preview block (inline customer, table, totals)
    app.css             # design tokens + reset (palette matches FORGE's xlsx)
    lib/
      types.ts          # shared types (mirrors FORGE)
      quote.ts          # computeLines, computeTotals, VAT_RATE, formatters
      csv.ts            # parseCsv (papaparse)
      xlsx.ts           # generateQuoteXlsxBuffer + downloadXlsx + read-back helper
      quote-number.ts   # localStorage-backed per-day counter
      config.ts         # bundled-config loader
  tests/
    quote.test.ts
    csv.test.ts
    xlsx-roundtrip.test.ts
  examples/
    input.csv           # canonical sample → 24,610.00 THB
```

## Integration decision — why re-implement client-side

The task brief offered three ways to consume FORGE's quotation math:

| Option | Approach | Verdict |
|--------|----------|---------|
| A | Import FORGE's code as a library | **Rejected** — FORGE's `quote.ts` imports `node:fs` / `node:os` / `node:path` for the file-backed counter, not browser-safe without refactoring a sibling. Couples internal API. |
| B | Spawn FORGE's CLI as subprocess | **Rejected** — requires a persistent backend, kills the static-deployable simplicity. |
| **C** | **Re-implement client-side** | **Chosen** — FORGE's math is 25 lines of pure functions. Duplication is cheap. The canonical value 24,610 THB is the *contract* (a test, not an API). Drift is caught by the build. |

Philosophy alignment: a prism is self-contained. It does not dial home to a backend to refract. See [`ψ/memory/retrospectives/2026-04/23/18.00_first-task.md`](../../ψ/memory/retrospectives/2026-04/23/18.00_first-task.md) for the full thinking.

## Non-goals (v1)

No PDF output, no multi-currency, no discount rows, no multi-company config switching, no production deploy, no multi-user, no quote history. These are v2 candidates if and when they're needed.

---

*Refracted by [PRISM Oracle 🎨](../../CLAUDE.md) — Refract · Arrange · Reveal.*
