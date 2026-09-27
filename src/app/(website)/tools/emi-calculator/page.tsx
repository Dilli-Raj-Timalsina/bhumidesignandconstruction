import type { Metadata } from "next";

import { EmiCalculator } from "@/components/website/tools/emi-calculator";
import { ToolHero } from "@/components/website/tools/tool-ui";

export const metadata: Metadata = {
  title: "EMI calculator",
  description:
    "Estimate monthly loan instalments and repayment totals in Nepalese Rupees.",
  alternates: { canonical: "/tools/emi-calculator" },
};

export default function EmiCalculatorPage() {
  return (
    <>
      <ToolHero
        eyebrow="BHUMI tools"
        title="EMI calculator"
        description="Plan an estimated monthly instalment, total interest, and total loan repayment in NPR."
      />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <EmiCalculator />
        </div>
      </section>
    </>
  );
}
