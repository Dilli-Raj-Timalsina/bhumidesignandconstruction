import type { Metadata } from "next";

import { ConcreteCalculator } from "@/components/website/tools/concrete-calculator";
import { ToolHero } from "@/components/website/tools/tool-ui";

export const metadata: Metadata = {
  title: "Concrete calculator",
  description:
    "Estimate cement, sand, and aggregate quantities for a concrete pour.",
  alternates: { canonical: "/tools/concrete-calculator" },
};

export default function ConcreteCalculatorPage() {
  return (
    <>
      <ToolHero
        eyebrow="BHUMI tools"
        title="Concrete calculator"
        description="Estimate concrete materials from dimensions, nominal mix grade, and a practical wastage allowance."
      />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <ConcreteCalculator />
        </div>
      </section>
    </>
  );
}
