import { formatDateKey } from './quote';

const STORAGE_KEY = 'prism-oracle.quote-counter';

type CounterState = Record<string, number>;

export interface QuoteNumberGenerator {
  next(date: Date): string;
}

function readBrowserState(): CounterState {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as CounterState) : {};
  } catch {
    return {};
  }
}

function writeBrowserState(state: CounterState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota exceeded — silent fallback
  }
}

function formatQuoteNumber(dateKey: string, n: number): string {
  return `Q-${dateKey}-${String(n).padStart(3, '0')}`;
}

/**
 * Browser-side counter backed by localStorage. Functionally equivalent to
 * FORGE's file-backed counter — same `Q-YYYYMMDD-NNN` format, same per-day reset.
 * Storage layer differs: file there, localStorage here.
 */
export function createBrowserCounter(): QuoteNumberGenerator {
  return {
    next(date: Date): string {
      const key = formatDateKey(date);
      const state = readBrowserState();
      const n = (state[key] ?? 0) + 1;
      state[key] = n;
      writeBrowserState(state);
      return formatQuoteNumber(key, n);
    },
  };
}

export function createMemoryCounter(): QuoteNumberGenerator {
  const state: CounterState = {};
  return {
    next(date: Date): string {
      const key = formatDateKey(date);
      state[key] = (state[key] ?? 0) + 1;
      return formatQuoteNumber(key, state[key] ?? 0);
    },
  };
}
