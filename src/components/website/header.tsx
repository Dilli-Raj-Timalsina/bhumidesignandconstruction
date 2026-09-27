"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BrandMark } from "./brand-mark";

const links = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function Header({ logoSrc }: { logoSrc?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="site-shell flex h-[76px] items-center justify-between gap-8">
        <BrandMark logoSrc={logoSrc} priority />

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="Primary navigation"
        >
          {links.map((link) => {
            const selected =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-[13px] font-semibold transition-colors hover:text-bhumi",
                  selected ? "text-bhumi" : "text-ink",
                )}
              >
                {link.label}
                {selected && (
                  <span className="absolute bottom-0 left-0 h-px w-full bg-bhumi" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href="/contact" size="sm">
            Start a project
          </ButtonLink>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center border border-line text-ink lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-[76px] min-h-[calc(100vh-76px)] border-b border-line bg-white px-5 pb-8 pt-10 lg:hidden">
          <nav
            className="site-shell flex flex-col"
            aria-label="Mobile navigation"
          >
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-5 text-3xl font-semibold tracking-[-0.045em] text-ink transition-colors hover:text-bhumi"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-8 w-full"
              size="lg"
            >
              Start a project
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
