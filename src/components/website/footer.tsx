import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { BrandMark } from "./brand-mark";

type FooterProps = {
  companyName?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  logoSrc?: string | null;
};

const navigation = [
  { href: "/about", label: "About Bhumi" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function Footer({
  companyName = "BHUMI DESIGN & CONSTRUCTION PVT. LTD.",
  location,
  email,
  phone,
  logoSrc,
}: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-white">
      <div className="site-shell grid gap-12 py-14 lg:grid-cols-[1.45fr_0.7fr_0.9fr] lg:gap-20 lg:py-20">
        <div>
          <BrandMark logoSrc={logoSrc} />
          <p className="mt-7 max-w-sm text-sm leading-7 text-muted">
            Civil engineering and construction solutions for turnkey residential
            and institutional infrastructure work.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            Navigate
          </p>
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
            {navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-ink transition-colors hover:text-bhumi"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            Contact
          </p>
          <div className="mt-5 space-y-3 text-sm leading-6 text-ink">
            {location && (
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-1 shrink-0 text-bhumi" />
                {location}
              </p>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="block font-semibold transition-colors hover:text-bhumi"
              >
                {phone}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1 font-semibold transition-colors hover:text-bhumi"
              >
                {email}
                <ArrowUpRight size={14} />
              </a>
            )}
            {!email && !phone && (
              <p className="max-w-[210px] text-muted">
                Contact details can be updated through the site settings.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="site-shell flex flex-col gap-2 py-5 text-[11px] font-medium uppercase tracking-[0.09em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {companyName}
          </p>
          <p>Built with engineering. Delivered with precision.</p>
        </div>
      </div>
    </footer>
  );
}
