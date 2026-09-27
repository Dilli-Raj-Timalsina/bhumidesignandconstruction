"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { inputClassName, ReferenceCard, ToolPanel } from "./tool-ui";

type AreaUnit = {
  label: string;
  factor: number;
};

const standardUnits: AreaUnit[] = [
  { label: "Square feet (sq ft)", factor: 1 },
  { label: "Square metres (sq m)", factor: 10.7639104167 },
  { label: "Square kilometres (sq km)", factor: 10_763_910.4167 },
  { label: "Square centimetres (sq cm)", factor: 0.00107639104 },
  { label: "Hectare (ha)", factor: 107_639.104167 },
  { label: "Acre", factor: 43_560 },
];

const hillUnits: AreaUnit[] = [
  { label: "Ropani", factor: 5_476 },
  { label: "Aana", factor: 342.25 },
  { label: "Paisa", factor: 85.5625 },
  { label: "Dam", factor: 21.390625 },
];

const teraiUnits: AreaUnit[] = [
  { label: "Bigha", factor: 72_900 },
  { label: "Kattha", factor: 3_645 },
  { label: "Dhur", factor: 182.25 },
];

function editableNumber(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";
  return String(Number(value.toFixed(6)));
}

function UnitInput({
  unit,
  squareFeet,
  onChange,
}: {
  unit: AreaUnit;
  squareFeet: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{unit.label}</span>
      <input
        className={`${inputClassName} mt-2`}
        type="number"
        inputMode="decimal"
        step="any"
        min="0"
        value={editableNumber(squareFeet / unit.factor)}
        onChange={(event) => {
          const value = Number(event.target.value);
          onChange(
            Number.isFinite(value) && value >= 0 ? value * unit.factor : 0,
          );
        }}
      />
    </label>
  );
}

export function AreaConverter() {
  const [squareFeet, setSquareFeet] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white p-4 md:px-6">
        <p className="text-sm leading-6 text-muted">
          Enter a value in any field to update every unit instantly.
        </p>
        <Button
          type="button"
          variant="subtle"
          size="sm"
          onClick={() => setSquareFeet(0)}
        >
          <RotateCcw size={15} /> Reset
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
        <ToolPanel
          eyebrow="Standard units"
          title="International measurement"
          description="Square area conversions used across drawings and estimates."
        >
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {standardUnits.map((unit) => (
              <UnitInput
                key={unit.label}
                unit={unit}
                squareFeet={squareFeet}
                onChange={setSquareFeet}
              />
            ))}
          </div>
        </ToolPanel>

        <div className="space-y-6">
          <ToolPanel
            eyebrow="Nepal hill units"
            title="Ropani · Aana · Paisa · Dam"
            description="Commonly used in Kathmandu, Pokhara, Lalitpur, and other hill regions."
          >
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {hillUnits.map((unit) => (
                <UnitInput
                  key={unit.label}
                  unit={unit}
                  squareFeet={squareFeet}
                  onChange={setSquareFeet}
                />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
              <span className="border border-line bg-canvas px-2 py-1">
                1 Ropani = 16 Aana
              </span>
              <span className="border border-line bg-canvas px-2 py-1">
                1 Aana = 4 Paisa
              </span>
              <span className="border border-line bg-canvas px-2 py-1">
                1 Paisa = 4 Dam
              </span>
            </div>
          </ToolPanel>
          <ToolPanel
            eyebrow="Nepal terai units"
            title="Bigha · Kattha · Dhur"
            description="Commonly used in the Terai, including the Dang region."
          >
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {teraiUnits.map((unit) => (
                <UnitInput
                  key={unit.label}
                  unit={unit}
                  squareFeet={squareFeet}
                  onChange={setSquareFeet}
                />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted">
              <span className="border border-line bg-canvas px-2 py-1">
                1 Bigha = 20 Kattha
              </span>
              <span className="border border-line bg-canvas px-2 py-1">
                1 Kattha = 20 Dhur
              </span>
            </div>
          </ToolPanel>
        </div>
      </div>

      <ToolPanel
        title="Quick reference"
        description="The conversions used by this tool."
      >
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <ReferenceCard title="Standard">
            <p>1 sq m = 10.764 sq ft</p>
            <p>1 hectare = 107,639 sq ft</p>
            <p>1 acre = 43,560 sq ft</p>
          </ReferenceCard>
          <ReferenceCard title="Ropani (hills)">
            <p>1 Ropani = 5,476 sq ft</p>
            <p>1 Aana = 342.25 sq ft</p>
            <p>1 Paisa = 85.56 sq ft</p>
            <p>1 Dam = 21.39 sq ft</p>
          </ReferenceCard>
          <ReferenceCard title="Bigha (Terai)">
            <p>1 Bigha = 72,900 sq ft</p>
            <p>1 Kattha = 3,645 sq ft</p>
            <p>1 Dhur = 182.25 sq ft</p>
          </ReferenceCard>
        </div>
      </ToolPanel>
    </div>
  );
}
