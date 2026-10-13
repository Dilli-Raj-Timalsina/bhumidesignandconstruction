import { AreaConverter } from "@/components/website/tools/area-converter";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("areaConverter", "/tools/area-converter");

export default async function AreaConverterPage() {
  const site = await getSiteContent();
  return (
    <>
      <PageIntro page="areaConverter" intro={site.pageIntros.areaConverter} />
      <section className="py-12 md:py-20">
        <div className="site-shell">
          <AreaConverter />
        </div>
      </section>
    </>
  );
}
