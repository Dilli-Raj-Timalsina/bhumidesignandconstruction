"use client";

import { ArrowRight, Calculator, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  InputField,
  inputClassName,
  ReferenceCard,
  ResultMetric,
  ToolPanel,
} from "./tool-ui";

const format = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);

function formatNpr(value: number) {
  return `NPR ${format(value)}`;
}

export function EmiCalculator() {
  const [amount, setAmount] = useState("5000000");
  const [annualRate, setAnnualRate] = useState("12");
  const [years, setYears] = useState("5");
  const [result, setResult] = useState<{
    emi: number;
    totalInterest: number;
    totalPayable: number;
    months: number;
  } | null>(null);

  const amountValue = Number(amount) || 0;
  const annualRateValue = Number(annualRate) || 0;
  const yearsValue = Number(years) || 0;

  function calculate() {
    const months = Math.round(yearsValue * 12);
    if (
      ![amountValue, annualRateValue, yearsValue].every(
        (value) => Number.isFinite(value) && value >= 0,
      ) ||
      amountValue <= 0 ||
      months <= 0
    ) {
      setResult(null);
      return;
    }

    const monthlyRate = annualRateValue / 12 / 100;
    const emi =
      monthlyRate === 0
        ? amountValue / months
        : (amountValue * monthlyRate * (1 + monthlyRate) ** months) /
          ((1 + monthlyRate) ** months - 1);
    const totalPayable = emi * months;

    setResult({
      emi,
      totalInterest: totalPayable - amountValue,
      totalPayable,
      months,
    });
  }

  function reset() {
    setAmount("5000000");
    setAnnualRate("12");
    setYears("5");
    setResult(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ToolPanel
          eyebrow="Inputs"
          title="Enter loan details"
          description="Amounts are in Nepalese Rupees (NPR)."
        >
          <div className="mt-6 space-y-6">
            <InputField
              label="Loan amount (NPR)"
              hint={`NPR ${(amountValue / 100_000).toFixed(2)} L`}
            >
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="1000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </InputField>
            <InputField
              label="Annual interest rate (%)"
              hint={`${annualRateValue || 0}%`}
            >
              <input
                className="mt-2 h-2 w-full cursor-pointer accent-bhumi"
                type="range"
                min="0"
                max="24"
                step="0.1"
                value={annualRate}
                onChange={(event) => setAnnualRate(event.target.value)}
              />
              <input
                className={`${inputClassName} mt-3`}
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={annualRate}
                onChange={(event) => setAnnualRate(event.target.value)}
              />
            </InputField>
            <InputField
              label="Loan tenure (years)"
              hint={`${Math.round(yearsValue * 12) || 0} months`}
            >
              <input
                className="mt-2 h-2 w-full cursor-pointer accent-bhumi"
                type="range"
                min="1"
                max="30"
                step="1"
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
              <input
                className={`${inputClassName} mt-3`}
                type="number"
                min="0"
                max="100"
                step="1"
                value={years}
                onChange={(event) => setYears(event.target.value)}
              />
            </InputField>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                type="button"
                onClick={calculate}
                className="flex-1 sm:flex-none"
              >
                Calculate EMI <ArrowRight size={16} />
              </Button>
              <Button type="button" variant="subtle" onClick={reset}>
                <RotateCcw size={15} /> Reset
              </Button>
            </div>
          </div>
        </ToolPanel>

        <ToolPanel
          eyebrow="Results"
          title="Payment summary"
          description="Monthly EMI, total interest, and repayment amount using the reducing-balance method."
        >
          {result ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ResultMetric
                label="Monthly EMI"
                value={formatNpr(result.emi)}
                note={`For ${result.months} monthly instalments`}
              />
              <ResultMetric
                label="Total interest"
                value={formatNpr(result.totalInterest)}
              />
              <ResultMetric
                label="Total payable"
                value={formatNpr(result.totalPayable)}
              />
              <ResultMetric label="Principal" value={formatNpr(amountValue)} />
            </div>
          ) : (
            <div className="mt-6 grid min-h-64 place-items-center border border-line bg-canvas p-8 text-center">
              <div>
                <Calculator
                  className="mx-auto text-bhumi"
                  size={28}
                  strokeWidth={1.6}
                />
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-ink">
                  No calculation yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Fill in the loan details and select Calculate EMI.
                </p>
              </div>
            </div>
          )}
        </ToolPanel>
      </div>

      <ToolPanel
        title="Quick reference"
        description="Formula and indicative annual interest-rate ranges in Nepal."
      >
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <ReferenceCard title="EMI formula">
            <p className="font-mono text-xs text-ink">
              EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1)
            </p>
            <p className="mt-3">
              P = principal · r = monthly rate · n = total monthly instalments
            </p>
          </ReferenceCard>
          <ReferenceCard title="Typical Nepal rates">
            <p>Home / housing loan: 9% – 13%</p>
            <p>Construction loan: 10% – 14%</p>
            <p>Personal loan: 12% – 18%</p>
            <p>Vehicle loan: 11% – 15%</p>
          </ReferenceCard>
        </div>
        <p className="mt-5 border-t border-line pt-5 text-xs leading-6 text-muted">
          This calculator uses the reducing-balance method. Actual repayment may
          vary with bank fees, insurance, rate changes, and other terms. Confirm
          the final rate and schedule with your lender.
        </p>
      </ToolPanel>
    </div>
  );
}
