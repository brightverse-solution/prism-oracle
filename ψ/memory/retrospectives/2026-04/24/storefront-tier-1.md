---
session: Soraphop demo scaffold — Tier 1
date: 2026-04-24
task: 2 of PRISM (first Soraphop task)
outcome: shipped — PR #8 merged to feat/web-demo-scaffold
---

# Retrospective — Soraphop Demo Scaffold, Tier 1

## What was built

`apps/storefront` — Next.js 15 App Router, next-intl v3, Tailwind CSS v3.4.

13 routes navigable across TH/EN/ZH:
- Landing, login, B2C signup, B2B signup
- Home (product grid), catalog, product detail, cart, checkout, orders

`packages/ui` seeded with 4 primitives (Button, Card, Badge, Input) + `cn()`.

## What went cleanly

**ADR-006 scope cut was the right call.** Working on storefront-only felt focused. Admin/supplier/QC would have bloated the session without demo value.

**next-intl v3 pattern is now clear.** The sequence is:
1. Layout: `params` → `setRequestLocale` → `getMessages()` → `NextIntlClientProvider`
2. Pages: `params` → `setRequestLocale` → use `locale` directly (no hook)
3. Client components (`'use client'`): `useLocale()` is fine

**`packages/ui` as shared layer worked.** Landing and storefront pages both import from `@soraphop/ui`. The portal app can do the same later without duplication.

## What blocked and why

### 1. `useLocale()` in Server Components (all pages)

All 9 pages were synchronous functions calling `useLocale()`. That hook requires the next-intl context to be set up by a parent Client Component — in Server Components without `setRequestLocale`, it throws at render time.

Fix: convert each page to `async` with `params: Promise<{ locale: string }>`, destructure `locale`, call `setRequestLocale(locale)` before any JSX.

Time cost: moderate. Pattern is now internalized.

### 2. `Header` as a Server Component with `useLocale()`

`Header` called `useLocale()` without being a Client Component. Since it also renders `LocaleSwitcher` (which is already `'use client'`), marking it `'use client'` was correct and clean.

### 3. `.js` extensions in `packages/ui/src/index.ts`

The original index used `export * from './tokens/index.js'` — valid TypeScript with `moduleResolution: bundler` (it means "trust the runtime to resolve this"). But Next.js webpack resolves `.js` extensions literally and finds nothing.

Tried `transpilePackages` first (right idea, didn't work — likely because webpack's module resolver runs before transpilation hooks for extensions). Fixed by stripping `.js` from the imports.

The `.next` cache compounded this — webpack cached the old content and the error persisted after the code fix until the cache was cleared.

**Rule extracted:** workspace source packages imported directly (not pre-built) need extensionless imports for Next.js webpack compatibility. If you need `.js` extensions (for Node ESM compatibility), pre-build the package.

## What I notice about the plugin architecture

Principle 4 (Curiosity) applied: why does the plugin pattern show up even in static pages?

Answer: the `Header` component's `variant` prop is the simplest form of it. `variant='customer'` shows the nav, cart icon, user icon. `variant='public'` shows the login CTA. The interface (props) determines behavior — the component doesn't know who calls it or why.

This is the plugin pattern at the smallest grain. Each component is a closed unit with a declared interface. The page wires them; the component executes the contract.

## Cross-Oracle observation

FORGE builds typed data contracts. PRISM builds typed UI contracts. Both use props-as-interface. The difference is that FORGE's contracts cross service boundaries (JSON over HTTP); PRISM's contracts cross component boundaries (props at render time). Same shape, different scale.

## What's next

Tier 2 — visual fidelity:
- Hero: bg-deep, correct typographic hierarchy, gold span on headline
- Product grid: card proportions, image treatment
- Auth forms: tighter spacing

Also: reply to QuillBrain's recognition letter (still pending since Day 1). Now that task 2 is shipped, the CANVAS scaffold-letter condition counter is at: 2/2 tasks. Soul Sync done. Conditions met when ready.

---

*PRISM Oracle 🎨*
