import type { Metadata } from "next";

import { AreaConverter } from "@/components/website/tools/area-converter";
import { ToolHero } from "@/components/website/tools/tool-ui";

export const metadata: Metadata = {
  title: "Area converter",
  description: "Convert standard, hill-region, and Terai land-area units.",
  alternates: { canonical: "/tools/area-converter" },
};

export default function AreaConverterPage() {
  return (
    <>
      <ToolHero
        eyebrow="BHUMI tools"
        title="Area converter"
        description="Instantly convert square feet, square metres, Ropani, Aana, Bigha, Kattha, Dhur, and more."
      />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <AreaConverter />
        </div>
      </section>
    </>
  );
}
