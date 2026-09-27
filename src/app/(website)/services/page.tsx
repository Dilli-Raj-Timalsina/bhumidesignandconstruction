import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ContentEmptyState } from "@/components/website/empty-content";
import { MediaFrame } from "@/components/website/media-frame";
import { CtaSection } from "@/components/website/cta-section";
import { getServices } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Services",
  description: "BHUMI civil engineering and construction services.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">Services</p>
          <h1 className="display-title mt-6 max-w-5xl">
            Work that moves from intent to execution.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            BHUMI&apos;s current capabilities are maintained here as the company
            portfolio is documented.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-28">
        <div className="site-shell">
          {services.length === 0 ? (
            <ContentEmptyState
              title="Services are being prepared."
              detail="Publish service information in the content workspace to introduce BHUMI’s supported capabilities."
            />
          ) : (
            <div className="border-t border-line">
              {services.map((service, index) => (
                <article
                  key={service.id}
                  id={service.slug}
                  className="scroll-mt-28 grid gap-7 border-b border-line py-9 md:grid-cols-[72px_minmax(0,1fr)_minmax(260px,0.72fr)] md:gap-10 md:py-12"
                >
                  <p className="text-xs font-bold tracking-[0.1em] text-bhumi">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-[-0.045em] text-ink md:text-4xl">
                      {service.title}
                    </h2>
                    {service.description && (
                      <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-8 text-muted">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="relative min-h-[230px] overflow-hidden">
                    <MediaFrame
                      src={service.coverImage}
                      alt={service.title}
                      className="absolute inset-0 h-full w-full"
                      label="Add service image"
                      sizes="(max-width: 768px) 100vw, 32vw"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
          <ButtonLink href="/contact" variant="text" className="mt-10">
            Discuss a project <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
