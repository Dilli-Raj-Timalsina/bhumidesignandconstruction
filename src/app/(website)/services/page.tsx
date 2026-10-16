import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { CtaSection } from "@/components/website/cta-section";
import { ContentEmptyState } from "@/components/website/empty-content";
import { ServiceOfferings } from "@/components/website/marketing-sections";
import { PageIntro } from "@/components/website/page-intro";
import { getPageIntroMetadata } from "@/features/content/metadata";
import { getServices, getSiteContent } from "@/features/content/queries";

export const generateMetadata = () =>
  getPageIntroMetadata("services", "/services");

export default async function ServicesPage() {
  const [site, services] = await Promise.all([getSiteContent(), getServices()]);
  return (
    <>
      <PageIntro page="services" intro={site.pageIntros.services} />
      <section className="py-16 md:py-28">
        <div className="site-shell">
          {services.length > 0 ? (
            <ServiceOfferings
              services={services}
              enquireLabel={site.editorial.serviceEnquiryCta}
            />
          ) : (
            <ContentEmptyState
              title="Services are being updated."
              detail="Published services will appear here shortly."
            />
          )}
          {site.editorial.servicesPageCta && (
            <ButtonLink href="/contact" variant="text" className="mt-10">
              {site.editorial.servicesPageCta} <ArrowUpRight size={16} />
            </ButtonLink>
          )}
        </div>
      </section>
      <CtaSection content={site.editorial} />
    </>
  );
}
