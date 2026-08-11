"use client";

import { useMemo, useRef, useState } from "react";
import { trackPortalEvent } from "@/lib/portal-events";

function money(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
function pct(n: number) {
  return `${n.toFixed(3)}%`;
}
function monthlyPI(principal: number, rate: number, years: number) {
  const r = rate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

export function MortgageCalculator() {
  const [price, setPrice] = useState(450000);
  const [downPct, setDownPct] = useState(3.5);
  const [rate, setRate] = useState(6.75);
  const [years, setYears] = useState(30);
  const [taxMonthly, setTaxMonthly] = useState(250);
  const [insuranceMonthly, setInsuranceMonthly] = useState(175);
  const [hoa, setHoa] = useState(0);
  const [pmiPct, setPmiPct] = useState(0.55);
  const trackedUse = useRef(false);

  function trackUse(field: string) {
    if (trackedUse.current) return;
    trackedUse.current = true;
    trackPortalEvent({
      eventType: "MORTGAGE_CALCULATOR_USED",
      eventValue: field,
      metadata: { price, downPct, rate, years },
    });
  }

  const result = useMemo(() => {
    const down = (price * downPct) / 100;
    const baseLoan = Math.max(price - down, 0);
    const principalInterest = monthlyPI(baseLoan, rate, years);
    const pmiMonthly = (baseLoan * pmiPct) / 100 / 12;
    const piti = principalInterest + taxMonthly + insuranceMonthly;
    const fullPayment = piti + pmiMonthly + hoa;
    return { down, baseLoan, principalInterest, pmiMonthly, piti, fullPayment };
  }, [price, downPct, rate, years, taxMonthly, insuranceMonthly, hoa, pmiPct]);

  const fields = [
    ["Purchase Price", price, setPrice, "$"],
    ["Down Payment %", downPct, setDownPct, "%"],
    ["Interest Rate", rate, setRate, "%"],
    ["Term Years", years, setYears, "yrs"],
    ["Property Taxes / mo", taxMonthly, setTaxMonthly, "$"],
    ["Home Insurance / mo", insuranceMonthly, setInsuranceMonthly, "$"],
    ["HOA / mo", hoa, setHoa, "$"],
    ["PMI / MIP % annual", pmiPct, setPmiPct, "%"],
  ] as const;

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/10 bg-white/[.04] p-6">
        <p className="kicker">Payment Tool</p>
        <h2 className="mt-2 text-3xl font-black">
          Mortgage Payment Calculator
        </h2>
        <p className="mt-2 text-ice/65">
          Estimate principal, interest, taxes, insurance, HOA, and PMI/MIP.
          FHA-style mortgage insurance defaults to 0.55% annually, but you can
          adjust it.
        </p>
      </div>
      <div className="grid gap-6 p-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([label, value, setter, suffix]) => (
            <label key={label} className="block">
              <span className="mb-2 block text-sm font-extrabold text-ice/70">
                {label}
              </span>
              <div className="relative">
                <input
                  className="field pr-14"
                  type="number"
                  value={value}
                  onChange={(e) => {
                    setter(Number(e.target.value));
                    trackUse(label);
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ice/45">
                  {suffix}
                </span>
              </div>
            </label>
          ))}
        </div>
        <div className="rounded-[2rem] border border-sky/20 bg-gradient-to-br from-sky/14 to-blue/10 p-5">
          <p className="text-sm font-black uppercase tracking-widest text-sky">
            Estimated Monthly Payment
          </p>
          <p className="mt-3 text-5xl font-black tracking-tight">
            {money(result.fullPayment)}
          </p>
          <div className="mt-6 grid gap-3">
            <div className="number-card flex justify-between">
              <span>Principal & Interest</span>
              <strong>{money(result.principalInterest)}</strong>
            </div>
            <div className="number-card flex justify-between">
              <span>Taxes + Insurance</span>
              <strong>{money(taxMonthly + insuranceMonthly)}</strong>
            </div>
            <div className="number-card flex justify-between">
              <span>PMI / MIP</span>
              <strong>{money(result.pmiMonthly)}</strong>
            </div>
            <div className="number-card flex justify-between">
              <span>HOA</span>
              <strong>{money(hoa)}</strong>
            </div>
            <div className="number-card flex justify-between border-sky/25 bg-sky/10">
              <span>Loan Amount</span>
              <strong>{money(result.baseLoan)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CostOfWaitingCalculator() {
  const [price, setPrice] = useState(450000);
  const [monthlyRent, setMonthlyRent] = useState(2200);
  const [appreciation, setAppreciation] = useState(4);
  const [waitMonths, setWaitMonths] = useState(12);
  const trackedUse = useRef(false);

  function trackUse(field: string) {
    if (trackedUse.current) return;
    trackedUse.current = true;
    trackPortalEvent({
      eventType: "COST_OF_WAITING_CALCULATOR_USED",
      eventValue: field,
      metadata: { price, monthlyRent, appreciation, waitMonths },
    });
  }

  const result = useMemo(() => {
    const safeMonths = Math.max(waitMonths, 0);
    const yearsWaiting = safeMonths / 12;
    const futurePrice = price * Math.pow(1 + appreciation / 100, yearsWaiting);
    const lostAppreciation = Math.max(futurePrice - price, 0);
    const rentSpent = monthlyRent * safeMonths;
    const totalCostOfWaiting = rentSpent + lostAppreciation;

    return { futurePrice, lostAppreciation, rentSpent, totalCostOfWaiting };
  }, [price, monthlyRent, appreciation, waitMonths]);

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-white/10 bg-white/[.04] p-6">
        <p className="kicker">Planning Tool</p>
        <h2 className="mt-2 text-3xl font-black">Cost of Waiting Calculator</h2>
        <p className="mt-2 text-ice/65">
          Estimate the money spent on rent while waiting plus the potential
          appreciation you may miss if home values rise. This is educational
          only, not a prediction.
        </p>
      </div>
      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_1fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-extrabold text-ice/70">
              Home Price Today
            </span>
            <input
              className="field"
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(Number(e.target.value));
                trackUse("Home Price Today");
              }}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-extrabold text-ice/70">
              Monthly Rent
            </span>
            <input
              className="field"
              type="number"
              value={monthlyRent}
              onChange={(e) => {
                setMonthlyRent(Number(e.target.value));
                trackUse("Monthly Rent");
              }}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-extrabold text-ice/70">
              Expected Appreciation % / yr
            </span>
            <input
              className="field"
              type="number"
              value={appreciation}
              onChange={(e) => {
                setAppreciation(Number(e.target.value));
                trackUse("Expected Appreciation");
              }}
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-extrabold text-ice/70">
              Months Waiting
            </span>
            <input
              className="field"
              type="number"
              value={waitMonths}
              onChange={(e) => {
                setWaitMonths(Number(e.target.value));
                trackUse("Months Waiting");
              }}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="number-card">
            <p className="text-ice/55">Rent Spent While Waiting</p>
            <strong className="mt-2 block text-3xl text-gold">
              {money(result.rentSpent)}
            </strong>
          </div>
          <div className="number-card">
            <p className="text-ice/55">Potential Appreciation Missed</p>
            <strong className="mt-2 block text-3xl text-gold">
              {money(result.lostAppreciation)}
            </strong>
          </div>
          <div className="number-card">
            <p className="text-ice/55">Estimated Future Price</p>
            <strong className="mt-2 block text-3xl">
              {money(result.futurePrice)}
            </strong>
          </div>
          <div className="number-card">
            <p className="text-ice/55">Waiting Period</p>
            <strong className="mt-2 block text-3xl">{waitMonths} months</strong>
          </div>
          <div className="number-card md:col-span-2 border-sky/25 bg-sky/10">
            <p className="text-ice/65">Estimated Cost of Waiting</p>
            <strong className="mt-2 block text-5xl">
              {money(result.totalCostOfWaiting)}
            </strong>
            <p className="mt-3 text-sm text-ice/55">
              Rent spent + potential appreciation missed
            </p>
          </div>
        </div>
      </div>
      <p className="px-6 pb-6 text-sm leading-6 text-ice/52">
        Assumptions are user-entered. This is not a forecast or guarantee. It
        does not include every possible cost, tax change, insurance change,
        market change, qualification issue, or program change.
      </p>
    </section>
  );
}
