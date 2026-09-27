import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { CtaSection } from "@/components/website/cta-section";
import { ServiceOfferings } from "@/components/website/marketing-sections";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Turnkey construction, civil and structural works, substation civil works, and supervised design and interior coordination by BHUMI.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">Services</p>
          <h1 className="display-title mt-6 max-w-5xl">
            Civil construction with a practical point of view.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            Turnkey residential delivery, civil and structural works, substation
            civil works, and supervised design and interior coordination.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-28">
        <div className="site-shell">
          <ServiceOfferings />
          <ButtonLink href="/contact" variant="text" className="mt-10">
            Discuss a project <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
