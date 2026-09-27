import Link from "next/link";
import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
  icon?: ReactNode;
}) {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mb-4 flex size-11 items-center justify-center bg-bhumi-light text-bhumi">
        {icon ?? <FolderOpen className="size-5" aria-hidden="true" />}
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-flex min-h-10 items-center bg-bhumi px-4 text-sm font-semibold text-white transition-colors hover:bg-bhumi-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bhumi"
        >
          {action.label}
        </Link>
      ) : null}
    </section>
  );
}
