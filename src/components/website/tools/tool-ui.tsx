import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ToolHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-line bg-canvas py-14 md:py-20">
      <div className="site-shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-title mt-5 max-w-4xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

export function ToolPanel({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("border border-line bg-white p-5 md:p-7", className)}
    >
      <div className="border-b border-line pb-5">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function InputField({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="flex items-baseline justify-between gap-3 text-sm font-semibold text-ink">
        {label}
        {hint && <span className="text-xs font-medium text-muted">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const inputClassName =
  "h-12 w-full rounded-none border border-line bg-white px-3 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-bhumi";

export function ResultMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="border border-line bg-canvas p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-ink">
        {value}
      </p>
      {note && <p className="mt-1 text-xs leading-5 text-muted">{note}</p>}
    </div>
  );
}

export function ReferenceCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-line bg-canvas p-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-muted">{children}</div>
    </div>
  );
}
