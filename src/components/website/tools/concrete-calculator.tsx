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

type Grade = "m10" | "m15" | "m20" | "m25";

const grades: Record<
  Grade,
  { label: string; ratio: [number, number, number]; description: string }
> = {
  m10: {
    label: "M10 (1:3:6)",
    ratio: [1, 3, 6],
    description: "Lean concrete — PCC and levelling.",
  },
  m15: {
    label: "M15 (1:2:4)",
    ratio: [1, 2, 4],
    description: "Non-structural elements such as PCC.",
  },
  m20: {
    label: "M20 (1:1.5:3)",
    ratio: [1, 1.5, 3],
    description: "Standard RCC — slabs, beams and columns.",
  },
  m25: {
    label: "M25 (1:1:2)",
    ratio: [1, 1, 2],
    description: "Higher-strength RCC structures.",
  },
};

const format = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);

export function ConcreteCalculator() {
  const [length, setLength] = useState("3");
  const [width, setWidth] = useState("3");
  const [depth, setDepth] = useState("0.15");
  const [structure, setStructure] = useState("Slab");
  const [grade, setGrade] = useState<Grade>("m20");
  const [units, setUnits] = useState("1");
  const [wastage, setWastage] = useState("5");
  const [result, setResult] = useState<{
    wetVolume: number;
    dryVolume: number;
    cementBags: number;
    sandVolume: number;
    sandWeight: number;
    aggregateVolume: number;
    aggregateWeight: number;
  } | null>(null);

  function calculate() {
    const values = [
      Number(length),
      Number(width),
      Number(depth),
      Number(units),
      Number(wastage),
    ];
    if (
      !values.every((value) => Number.isFinite(value) && value >= 0) ||
      values.slice(0, 4).some((value) => value <= 0)
    ) {
      setResult(null);
      return;
    }

    const wetVolume =
      Number(length) *
      Number(width) *
      Number(depth) *
      Number(units) *
      (1 + Number(wastage) / 100);
    const dryVolume = wetVolume * 1.57;
    const [cementPart, sandPart, aggregatePart] = grades[grade].ratio;
    const totalParts = cementPart + sandPart + aggregatePart;
    const cementVolume = dryVolume * (cementPart / totalParts);
    const sandVolume = dryVolume * (sandPart / totalParts);
    const aggregateVolume = dryVolume * (aggregatePart / totalParts);

    setResult({
      wetVolume,
      dryVolume,
      cementBags: cementVolume / 0.0347,
      sandVolume,
      sandWeight: sandVolume * 1600,
      aggregateVolume,
      aggregateWeight: aggregateVolume * 1500,
    });
  }

  function reset() {
    setLength("3");
    setWidth("3");
    setDepth("0.15");
    setStructure("Slab");
    setGrade("m20");
    setUnits("1");
    setWastage("5");
    setResult(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <ToolPanel
        eyebrow="Inputs"
        title="Enter details"
        description="Dimensions are in metres. A 5% wastage allowance is applied by default."
      >
        <div className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField label="Length (m)">
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="any"
                value={length}
                onChange={(event) => setLength(event.target.value)}
              />
            </InputField>
            <InputField label="Width (m)">
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="any"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </InputField>
          </div>
          <InputField label="Depth / thickness (m)">
            <input
              className={inputClassName}
              type="number"
              min="0"
              step="any"
              value={depth}
              onChange={(event) => setDepth(event.target.value)}
            />
          </InputField>
          <InputField label="Structure type">
            <select
              className={inputClassName}
              value={structure}
              onChange={(event) => setStructure(event.target.value)}
            >
              <option>Slab</option>
              <option>Beam</option>
              <option>Column</option>
              <option>Footing</option>
            </select>
          </InputField>
          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Concrete grade (mix ratio)
            </legend>
            <div className="mt-2 grid gap-2">
              {(
                Object.entries(grades) as [Grade, (typeof grades)[Grade]][]
              ).map(([value, concreteGrade]) => (
                <label
                  key={value}
                  className={`cursor-pointer border p-3 transition-colors ${
                    grade === value
                      ? "border-bhumi bg-canvas"
                      : "border-line hover:border-bhumi"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="concrete-grade"
                    checked={grade === value}
                    onChange={() => setGrade(value)}
                  />
                  <span className="block text-sm font-semibold text-ink">
                    {concreteGrade.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    {concreteGrade.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField label="No. of units">
              <input
                className={inputClassName}
                type="number"
                min="1"
                step="1"
                value={units}
                onChange={(event) => setUnits(event.target.value)}
              />
            </InputField>
            <InputField label="Wastage (%)">
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="0.5"
                value={wastage}
                onChange={(event) => setWastage(event.target.value)}
              />
            </InputField>
          </div>
          <p className="border-l-2 border-bhumi pl-3 text-xs leading-5 text-muted">
            Estimate shown for {structure.toLowerCase()} work using{" "}
            {grades[grade].label}.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              type="button"
              onClick={calculate}
              className="flex-1 sm:flex-none"
            >
              Calculate <ArrowRight size={16} />
            </Button>
            <Button type="button" variant="subtle" onClick={reset}>
              <RotateCcw size={15} /> Reset
            </Button>
          </div>
        </div>
      </ToolPanel>

      <div className="space-y-6">
        <ToolPanel
          eyebrow="Results"
          title="Material breakdown"
          description="Cement, sand, and aggregate quantities with the selected wastage allowance."
        >
          {result ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <ResultMetric
                label="Wet volume"
                value={`${format(result.wetVolume, 3)} m³`}
                note="Includes wastage"
              />
              <ResultMetric
                label="Dry volume"
                value={`${format(result.dryVolume, 3)} m³`}
                note="Wet volume × 1.57"
              />
              <ResultMetric
                label="Cement"
                value={`${format(result.cementBags)} bags`}
                note="50 kg bags"
              />
              <ResultMetric
                label="Sand"
                value={`${format(result.sandVolume, 3)} m³`}
                note={`${format(result.sandWeight, 0)} kg estimated`}
              />
              <ResultMetric
                label="Aggregate"
                value={`${format(result.aggregateVolume, 3)} m³`}
                note={`${format(result.aggregateWeight, 0)} kg estimated`}
              />
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
                  Fill in the dimensions and select Calculate.
                </p>
              </div>
            </div>
          )}
        </ToolPanel>

        <ToolPanel
          title="Reference specs"
          description="Constants used in this estimate."
        >
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <ReferenceCard title="Mix ratios">
              <p>M10: 1:3:6 · M15: 1:2:4</p>
              <p className="mt-2">M20: 1:1.5:3 · M25: 1:1:2</p>
            </ReferenceCard>
            <ReferenceCard title="Material constants">
              <p>50 kg cement bag: 0.0347 m³</p>
              <p className="mt-2">Sand: 1,600 kg/m³ · Aggregate: 1,500 kg/m³</p>
            </ReferenceCard>
            <ReferenceCard title="Method">
              <p>
                Dry volume = wet volume × 1.57. Material shares follow the
                selected nominal mix.
              </p>
            </ReferenceCard>
          </div>
        </ToolPanel>
      </div>
    </div>
  );
}
