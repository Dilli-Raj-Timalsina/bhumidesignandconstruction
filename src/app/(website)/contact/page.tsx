import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/website/contact-form";
import { getSiteContent } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation with BHUMI Design & Construction.",
  alternates: { canonical: "/contact" },
};

const locationMapUrl = "https://maps.app.goo.gl/hS54ori1w87ArjM68";
const locationMapEmbedUrl =
  "https://www.google.com/maps?q=28.113561%2C82.338714&z=17&output=embed";

export default async function ContactPage() {
  const site = await getSiteContent();
  const contacts = [
    site.address || site.location
      ? {
          icon: MapPin,
          label: "Location",
          value: site.address || site.location,
        }
      : null,
    site.phone
      ? {
          icon: Phone,
          label: "Phone",
          value: site.phone,
          href: `tel:${site.phone}`,
        }
      : null,
    site.email
      ? {
          icon: Mail,
          label: "Email",
          value: site.email,
          href: `mailto:${site.email}`,
        }
      : null,
  ].filter(
    (
      item,
    ): item is {
      icon: typeof MapPin;
      label: string;
      value: string;
      href?: string;
    } => item !== null,
  );
  return (
    <>
      <section className="border-b border-line bg-canvas py-16 md:py-24">
        <div className="site-shell">
          <p className="eyebrow">Contact</p>
          <h1 className="display-title mt-6 max-w-5xl">
            Let&apos;s discuss your project.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            Reach BHUMI in Tulsipur, Dang for civil engineering and construction
            requirements.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-28">
        <div className="site-shell">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(430px,1.2fr)] lg:gap-24">
            <div>
              <p className="eyebrow">Start a conversation</p>
              <h2 className="section-title mt-5">Start with the scope.</h2>
              <p className="mt-6 max-w-md text-base leading-8 text-muted">
                Share your requirements and the team will respond using the
                details below.
              </p>
              <div className="mt-10 space-y-6">
                {contacts.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center border border-line text-bhumi">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="mt-1 block text-sm font-semibold text-ink hover:text-bhumi"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
          <div className="relative mt-12 overflow-hidden border border-line bg-bhumi-light/30 md:mt-16">
            <iframe
              title="BHUMI Design & Construction location in Tulsipur, Dang, Nepal"
              src={locationMapEmbedUrl}
              className="h-[300px] w-full border-0 md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute left-4 top-4 bg-white/95 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-bhumi">
              {site.location || "Tulsipur, Dang, Nepal"}
            </div>
            <a
              href={locationMapUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 left-4 inline-flex items-center gap-2 border border-line bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:border-bhumi hover:text-bhumi"
            >
              Open in Google Maps <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
