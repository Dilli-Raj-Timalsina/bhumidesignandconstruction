import { ConcreteCalculator } from "@/components/website/tools/concrete-calculator";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("concreteCalculator", "/tools/concrete-calculator");

export default async function ConcreteCalculatorPage() {
  const site = await getSiteContent();
  return (
    <>
      <PageIntro
        page="concreteCalculator"
        intro={site.pageIntros.concreteCalculator}
      />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <ConcreteCalculator />
        </div>
      </section>
    </>
  );
}
