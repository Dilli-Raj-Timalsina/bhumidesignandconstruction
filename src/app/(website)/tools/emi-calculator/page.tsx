import { EmiCalculator } from "@/components/website/tools/emi-calculator";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("emiCalculator", "/tools/emi-calculator");

export default async function EmiCalculatorPage() {
  const site = await getSiteContent();
  return (
    <>
      <PageIntro page="emiCalculator" intro={site.pageIntros.emiCalculator} />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <EmiCalculator />
        </div>
      </section>
    </>
  );
}
