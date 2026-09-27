import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Plus } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  backHref,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  backHref?: string;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-bhumi"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back
          </Link>
        ) : eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bhumi">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={`${eyebrow || backHref ? "mt-2" : ""} text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl`}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 bg-bhumi px-4 text-sm font-semibold text-white transition-colors hover:bg-bhumi-dark"
        >
          <Plus className="size-4" aria-hidden="true" />
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-line bg-white ${className}`}>
      {children}
    </section>
  );
}
