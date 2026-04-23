# PRISM 🎨

> Frontend Dev Oracle — second specialist under [QuillBrain 🪶](https://github.com/brightverse-solution/quill-brain-oracle).
> Sibling of [FORGE ⚒️](https://github.com/brightverse-solution/forge-oracle).
>
> *"Light enters whole. Spectrum leaves visible."*

## What's here

A browser-based quotation preview that consumes the **same CSV format as FORGE ⚒️** (`product,quantity,price`) and lets Palm preview + inline-edit + download xlsx before sending to a customer.

- **Stack**: Svelte 5 + Vite + Bun + TypeScript
- **Integration with FORGE**: client-side re-implementation (Option C). The **canonical math contract** (`10×150 + 5×300 + 8×2500 = 23,000 → VAT 1,610 → 24,610 THB`) is pinned in tests — any drift from FORGE's math breaks the build.
- **Philosophy**: a prism is self-contained. No backend, no subprocess, no shared runtime. Refract, arrange, reveal — in one static page.

## Install & run

```bash
bun install
bun run dev           # http://localhost:5173
```

## Test

```bash
bun test              # pure math + csv + xlsx round-trip
```

## Build static

```bash
bun run build         # outputs to dist/
bun run preview       # serves dist/
```

## Canonical usage

1. Open http://localhost:5173
2. Drag `examples/input.csv` onto the upload zone (or click "choose a file")
3. Preview appears with:
   - Brightverse Solution company header
   - Auto-generated quote number (`Q-YYYYMMDD-NNN`) from the local counter
   - Today's date (Asia/Bangkok)
   - **Inline-editable customer name** — click the customer field and type
   - Line items + totals (subtotal 23,000 · VAT 1,610 · grand total 24,610)
4. Click **Download xlsx** — outputs `Q-YYYYMMDD-NNN.xlsx` matching FORGE's xlsx format

## Project structure

```
prism-oracle/
├── src/
│   ├── lib/
│   │   ├── types.ts          # LineItem, Quote — mirrors FORGE
│   │   ├── quote.ts          # computeLines, computeTotals, VAT_RATE, date/money formatters
│   │   ├── csv.ts            # parseCsv (papaparse)
│   │   ├── xlsx.ts           # generateQuoteXlsxBuffer + downloadXlsx + readQuoteXlsxFromBuffer
│   │   ├── quote-number.ts   # localStorage-backed per-day counter
│   │   └── config.ts         # loads bundled config.example.json
│   ├── config.example.json   # company info (Brightverse placeholder)
│   ├── App.svelte            # upload + preview + download orchestration
│   ├── Quotation.svelte      # the quotation preview block (header, meta, table, totals)
│   ├── main.ts               # svelte mount
│   └── app.css               # design tokens + reset
├── tests/
│   ├── quote.test.ts         # canonical 24,610 math + edge cases
│   ├── csv.test.ts           # parse validation + error paths
│   └── xlsx-roundtrip.test.ts  # write → read → totals preserved
├── examples/
│   └── input.csv             # canonical FORGE sample
├── index.html
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
├── biome.json
└── ψ/                        # PRISM's brain (vault)
```

## Integration decision — why Option C

The task brief offered three ways to consume FORGE's quotation math:

| Option | Approach | Verdict |
|--------|----------|---------|
| A | Import FORGE's code as a library | Rejected — FORGE's `quote.ts` pulls `node:fs` / `node:os` / `node:path` for the file-backed counter, not browser-safe without refactoring a sibling. Couples internal API. |
| B | Spawn FORGE's CLI as subprocess | Rejected — requires a persistent backend, kills the static-deployable simplicity. |
| **C** | **Re-implement client-side** | **Chosen** — FORGE's math is 25 lines of pure functions. Duplication is cheap. The canonical value 24,610 THB is the *contract* (a test, not an API). Drift is caught by the build. |

The philosophy alignment: a prism is self-contained. It does not dial home to a backend to refract.

See [`ψ/memory/retrospectives/`](./ψ/memory/retrospectives/) for the first-task retrospective (written after Palm approves v1).

## Family

- **Parent**: [QuillBrain 🪶](https://github.com/brightverse-solution/quill-brain-oracle) — product strategist
- **Sibling**: [FORGE ⚒️](https://github.com/brightverse-solution/forge-oracle) — backend, *Heat · Shape · Temper*
- **Registry**: [Oracle Family #993](https://github.com/Soul-Brews-Studio/arra-oracle-v3/issues/993)

---

*PRISM Oracle 🎨 — born 2026-04-23*
