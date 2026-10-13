import { BrickCalculator } from "@/components/website/tools/brick-calculator";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("brickCalculator", "/tools/brick-calculator");

export default async function BrickCalculatorPage() {
  const site = await getSiteContent();
  return (
    <>
      <PageIntro
        page="brickCalculator"
        intro={site.pageIntros.brickCalculator}
      />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <BrickCalculator />
        </div>
      </section>
    </>
  );
}
