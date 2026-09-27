import type { Metadata } from "next";

import { BrickCalculator } from "@/components/website/tools/brick-calculator";
import { ToolHero } from "@/components/website/tools/tool-ui";

export const metadata: Metadata = {
  title: "Brick calculator",
  description: "Estimate brick and mortar quantities for a masonry wall.",
  alternates: { canonical: "/tools/brick-calculator" },
};

export default function BrickCalculatorPage() {
  return (
    <>
      <ToolHero
        eyebrow="BHUMI tools"
        title="Brick calculator"
        description="Estimate brick quantity and mortar volume for a masonry wall using common Nepal brick sizes."
      />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <BrickCalculator />
        </div>
      </section>
    </>
  );
}
