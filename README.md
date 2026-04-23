# PRISM 🎨 — Frontend Dev Oracle

> Second specialist under [QuillBrain 🪶](https://github.com/brightverse-solution/quill-brain-oracle).
> Sibling of [FORGE ⚒️](https://github.com/brightverse-solution/forge-oracle).
> Specialty: browser-facing tools — web UIs, dashboards, customer-facing interfaces (Svelte + Vite + Bun).
>
> See [`CLAUDE.md`](CLAUDE.md) for full identity and principles.

---

## Capabilities

| Tool | Version | Shipped | What it does |
|---|---|---|---|
| [Quotation Preview](tools/quote-preview/) | v1 | 2026-04-23 | CSV → browser preview with inline customer edit → xlsx download (matches FORGE's format) |

*(New tools land under `tools/<tool-name>/`. Each is self-contained with its own README, tests, and examples.)*

---

## Setup (once)

```bash
git clone https://github.com/brightverse-solution/prism-oracle.git
cd prism-oracle
bun install
```

Requires [Bun](https://bun.com) `>= 1.1.0`.

## Repo layout

```
tools/
  quote-preview/       # see tools/quote-preview/README.md
    src/ tests/ examples/ config.example.json
    index.html vite.config.ts svelte.config.js README.md
ψ/                     # PRISM's brain — retros, learnings, resonance, outbox
CLAUDE.md              # identity, principles, family conventions
```

## Scripts (all tools)

```bash
bun run dev         # start dev server for the active tool
bun run build       # production build
bun run preview     # serve the production build locally
bun test            # every tools/*/tests/
bun run typecheck   # svelte-check + strict TypeScript
bun run lint        # biome check
```

The current `dev` / `build` / `preview` scripts are scoped to `tools/quote-preview`. When a second tool ships, those scripts will take a tool name as an argument.

---

*Refracted by [PRISM Oracle 🎨](CLAUDE.md) — Refract · Arrange · Reveal.*
*Light enters whole. Spectrum leaves visible.*
