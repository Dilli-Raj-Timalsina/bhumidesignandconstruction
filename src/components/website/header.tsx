"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
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
  { href: "/contact", label: "Contact" },
];

const toolLinks = [
  {
    href: "/tools/brick-calculator",
    label: "Brick calculator",
    description: "Estimate bricks and mortar for a wall.",
  },
  {
    href: "/tools/area-converter",
    label: "Area converter",
    description: "Convert standard and Nepal land units.",
  },
  {
    href: "/tools/concrete-calculator",
    label: "Concrete calculator",
    description: "Estimate concrete materials by mix grade.",
  },
  {
    href: "/tools/emi-calculator",
    label: "EMI calculator",
    description: "Plan a monthly loan repayment.",
  },
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
              <div key={link.href} className="contents">
                <Link
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
                {link.href === "/services" && (
                  <div className="group relative">
                    <Link
                      href="/tools"
                      aria-haspopup="true"
                      className={cn(
                        "relative flex items-center gap-1 py-2 text-[13px] font-semibold transition-colors hover:text-bhumi",
                        pathname.startsWith("/tools")
                          ? "text-bhumi"
                          : "text-ink",
                      )}
                    >
                      Tools <ChevronDown size={14} strokeWidth={1.8} />
                      {pathname.startsWith("/tools") && (
                        <span className="absolute bottom-0 left-0 h-px w-full bg-bhumi" />
                      )}
                    </Link>
                    <div className="invisible pointer-events-none absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100">
                      <div className="border border-line bg-white p-2">
                        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                          Planning tools
                        </p>
                        {toolLinks.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className="block px-3 py-2.5 transition-colors hover:bg-canvas"
                          >
                            <span className="block text-sm font-semibold text-ink">
                              {tool.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-muted">
                              {tool.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line py-5 text-3xl font-semibold tracking-[-0.045em] text-ink transition-colors hover:text-bhumi"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  {link.label}
                </Link>
                {link.href === "/services" && (
                  <div className="border-b border-line py-5">
                    <Link
                      href="/tools"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between text-3xl font-semibold tracking-[-0.045em] text-ink transition-colors hover:text-bhumi"
                    >
                      Tools <ChevronDown size={22} strokeWidth={1.8} />
                    </Link>
                    <div className="mt-4 grid gap-1 border-l border-line pl-4">
                      {toolLinks.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setOpen(false)}
                          className="py-2 text-sm font-semibold text-muted transition-colors hover:text-bhumi"
                        >
                          {tool.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
