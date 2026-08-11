/**
 * lib/calc-format.ts
 * ---------------------------------------------------------------------------
 * Shared formatting + finance helpers for the Homebuyer Tools (/calculators).
 * Pure functions only — safe to import from client or server components.
 */

/** Whole-dollar currency, e.g. $1,234 */
export function money(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/** Coerce any input value to a finite number (empty/NaN -> 0). */
export function num(v: string | number): number {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

/** "Mon YYYY" label i months from today (used for payoff dates). */
export function monthLabel(i: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + i);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Standard amortized monthly payment.
 * principal: loan amount, annualRatePct: e.g. 6.75, months: term in months.
 */
export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  return (principal * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
}
