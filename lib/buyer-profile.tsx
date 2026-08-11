'use client';

/**
 * lib/buyer-profile.tsx
 * ---------------------------------------------------------------------------
 * Shared "buyer profile" — the single source of truth for the numbers that
 * recur across the Tools page and the "My Numbers" intake. Persisted to
 * localStorage so it survives navigation and page reloads, and so values
 * entered once (on /my-numbers or in any tool) populate every tool.
 *
 * Privacy: only rough dollar amounts live here — never card/account numbers,
 * account names, Social Security numbers, or any personal information.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type CoBorrower = {
  incomeType: string;
  hourlyRate: number;
  hoursPerWeek: number;
  annualSalary: number;
  monthlyBase: number;
  otMonthly: number;
  otStable: boolean;
  monthlyDebts: number;
};

export const emptyCoBorrower = (): CoBorrower => ({
  incomeType: 'annual', hourlyRate: 25, hoursPerWeek: 40, annualSalary: 60000,
  monthlyBase: 5000, otMonthly: 0, otStable: false, monthlyDebts: 0,
});

export type BuyerProfile = {
  // Income & rate
  income: number;        // qualifying gross monthly income (base + OT only if stable)
  rate: number;          // purchase interest rate
  // Income breakdown (how income was entered)
  incomeType: string;    // 'hourly' | 'annual' | 'monthly'
  hourlyRate: number;
  hoursPerWeek: number;
  annualSalary: number;
  monthlyBase: number;   // base monthly income before OT
  otMonthly: number;     // average monthly overtime / bonus
  otStable: boolean;     // OT stable 2+ years — lenders only count it if true
  // Co-borrowers (optional — one entry per additional borrower on the loan)
  coBorrowers: CoBorrower[];
  // Housing goals
  rent: number;          // current monthly rent
  savings: number;       // savings available toward a down payment
  targetPayment: number; // comfortable monthly payment
  // Debts
  otherDebts: number;    // monthly non-housing debts not captured below
  ccBalance: number;
  ccApr: number;
  ccPayment: number;
  autoBalance: number;
  autoRate: number;
  autoPayment: number;
  studentBalance: number;
  studentRate: number;
  studentPayment: number;
};

const DEFAULTS: BuyerProfile = {
  income: 7000,
  rate: 6.75,
  incomeType: 'annual',
  hourlyRate: 30,
  hoursPerWeek: 40,
  annualSalary: 84000,
  monthlyBase: 7000,
  otMonthly: 0,
  otStable: false,
  coBorrowers: [],
  rent: 1800,
  savings: 25000,
  targetPayment: 2200,
  otherDebts: 0,
  ccBalance: 0,
  ccApr: 24.99,
  ccPayment: 0,
  autoBalance: 0,
  autoRate: 7.5,
  autoPayment: 0,
  studentBalance: 0,
  studentRate: 6.5,
  studentPayment: 0,
};

const STORAGE_KEY = 'bch_buyer_profile';

type Ctx = {
  p: BuyerProfile;
  set: <K extends keyof BuyerProfile>(k: K, v: BuyerProfile[K]) => void;
  reset: () => void;
};
const ProfileCtx = createContext<Ctx | null>(null);

export function BuyerProfileProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<BuyerProfile>(DEFAULTS);

  // Hydrate from localStorage after mount (keeps SSR + first render consistent).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setP((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist on every change so all tools + the intake stay in sync.
  // Skip the very first run so the initial DEFAULTS can't overwrite saved data
  // before hydration has applied.
  const firstSave = useRef(true);
  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, [p]);

  const set = useCallback(<K extends keyof BuyerProfile>(k: K, v: BuyerProfile[K]) => {
    setP((prev) => (prev[k] === v ? prev : { ...prev, [k]: v }));
  }, []);
  const reset = useCallback(() => setP(DEFAULTS), []);

  return <ProfileCtx.Provider value={{ p, set, reset }}>{children}</ProfileCtx.Provider>;
}

export function useBuyerProfile(): Ctx {
  const c = useContext(ProfileCtx);
  if (!c) throw new Error('useBuyerProfile must be used within BuyerProfileProvider');
  return c;
}

export const totalMonthlyDebts = (p: BuyerProfile) =>
  p.otherDebts + p.ccPayment + p.autoPayment + p.studentPayment +
  p.coBorrowers.reduce((s, c) => s + (c.monthlyDebts || 0), 0);
