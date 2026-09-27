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

type BrickType = "terai" | "bhaktapur";
type WallThickness = "single" | "double";
type Unit = "meter" | "foot";

const brickTypes = {
  terai: { label: "Terai brick", dimensions: [230, 110, 65] },
  bhaktapur: { label: "Bhaktapur brick", dimensions: [210, 100, 50] },
} as const;

const format = (value: number, digits = 2) =>
  new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);

export function BrickCalculator() {
  const [unit, setUnit] = useState<Unit>("meter");
  const [length, setLength] = useState("3");
  const [height, setHeight] = useState("2.4");
  const [thickness, setThickness] = useState<WallThickness>("single");
  const [mortar, setMortar] = useState("10");
  const [brickType, setBrickType] = useState<BrickType>("terai");
  const [wastage, setWastage] = useState("5");
  const [result, setResult] = useState<{
    wallArea: number;
    wallVolume: number;
    brickCount: number;
    mortarVolume: number;
  } | null>(null);

  const unitLabel = unit === "meter" ? "m" : "ft";

  function calculate() {
    const toMeters = unit === "meter" ? 1 : 0.3048;
    const wallLength = Number(length) * toMeters;
    const wallHeight = Number(height) * toMeters;
    const mortarThickness = Number(mortar) / 1000;
    const waste = Number(wastage) / 100;

    if (
      ![wallLength, wallHeight, mortarThickness, waste].every(
        (value) => Number.isFinite(value) && value >= 0,
      ) ||
      wallLength <= 0 ||
      wallHeight <= 0
    ) {
      setResult(null);
      return;
    }

    const [brickLength, brickWidth, brickHeight] = brickTypes[
      brickType
    ].dimensions.map((value) => value / 1000);
    const wallDepth = thickness === "single" ? 0.1016 : 0.2286;
    const wallArea = wallLength * wallHeight;
    const wallVolume = wallArea * wallDepth;
    const effectiveBrickVolume =
      (brickLength + mortarThickness) *
      (brickWidth + mortarThickness) *
      (brickHeight + mortarThickness);
    const baseBrickCount = wallVolume / effectiveBrickVolume;
    const brickCount = Math.ceil(baseBrickCount * (1 + waste));
    const brickVolume = brickLength * brickWidth * brickHeight;
    const mortarVolume = Math.max(0, wallVolume - baseBrickCount * brickVolume);

    setResult({ wallArea, wallVolume, brickCount, mortarVolume });
  }

  function reset() {
    setUnit("meter");
    setLength("3");
    setHeight("2.4");
    setThickness("single");
    setMortar("10");
    setBrickType("terai");
    setWastage("5");
    setResult(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <ToolPanel
        eyebrow="Inputs"
        title="Enter wall details"
        description="Estimate brick quantity by wall volume. Wastage defaults to 5%."
      >
        <div className="mt-6 space-y-5">
          <div>
            <span className="text-sm font-semibold text-ink">
              Dimension unit
            </span>
            <div className="mt-2 grid grid-cols-2 border border-line p-1">
              {(["meter", "foot"] as Unit[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUnit(value)}
                  className={`h-9 text-sm font-semibold transition-colors ${
                    unit === value
                      ? "bg-bhumi text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {value === "meter" ? "Meter" : "Foot"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField label={`Wall length (${unitLabel})`}>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="any"
                value={length}
                onChange={(event) => setLength(event.target.value)}
              />
            </InputField>
            <InputField label={`Wall height (${unitLabel})`}>
              <input
                className={inputClassName}
                type="number"
                min="0"
                step="any"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </InputField>
          </div>
          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Wall thickness
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["single", "Single wall", "4 inches"],
                  ["double", "Double wall", "9 inches"],
                ] as const
              ).map(([value, label, detail]) => (
                <label
                  key={value}
                  className={`cursor-pointer border p-3 transition-colors ${
                    thickness === value
                      ? "border-bhumi bg-canvas"
                      : "border-line hover:border-bhumi"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="wall-thickness"
                    checked={thickness === value}
                    onChange={() => setThickness(value)}
                  />
                  <span className="block text-sm font-semibold text-ink">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {detail}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <InputField label="Mortar thickness (mm)">
            <input
              className={inputClassName}
              type="number"
              min="0"
              step="1"
              value={mortar}
              onChange={(event) => setMortar(event.target.value)}
            />
          </InputField>
          <InputField label="Brick type">
            <select
              className={inputClassName}
              value={brickType}
              onChange={(event) =>
                setBrickType(event.target.value as BrickType)
              }
            >
              {Object.entries(brickTypes).map(([value, brick]) => (
                <option key={value} value={value}>
                  {brick.label} ({brick.dimensions.join(" × ")} mm)
                </option>
              ))}
            </select>
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
          description="Use these planning estimates as a starting point for a site measurement."
        >
          {result ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ResultMetric
                label="Wall area"
                value={`${format(result.wallArea)} m²`}
              />
              <ResultMetric
                label="Wall volume"
                value={`${format(result.wallVolume, 3)} m³`}
              />
              <ResultMetric
                label="Bricks required"
                value={format(result.brickCount, 0)}
                note={`Includes ${wastage || 0}% wastage`}
              />
              <ResultMetric
                label="Estimated mortar"
                value={`${format(result.mortarVolume, 3)} m³`}
                note="Before wastage allowance"
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
                  Fill in the wall details and select Calculate.
                </p>
              </div>
            </div>
          )}
        </ToolPanel>

        <ToolPanel
          title="Reference specs"
          description="Standard sizes used in this calculator."
        >
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <ReferenceCard title="Brick types">
              <p>Terai: 230 × 110 × 65 mm</p>
              <p className="mt-2">Bhaktapur: 210 × 100 × 50 mm</p>
            </ReferenceCard>
            <ReferenceCard title="Wall thickness">
              <p>Single wall: 4 inches</p>
              <p className="mt-2">Double wall: 9 inches</p>
            </ReferenceCard>
            <ReferenceCard title="Method">
              <p>
                Volume-based estimate with mortar joints included in the
                effective brick size.
              </p>
            </ReferenceCard>
          </div>
        </ToolPanel>
      </div>
    </div>
  );
}
