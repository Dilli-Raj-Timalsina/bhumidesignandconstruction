import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ContentEmptyState({
  title,
  detail,
  adminHref,
}: {
  title: string;
  detail: string;
  adminHref?: string;
}) {
  return (
    <div className="border border-dashed border-line bg-canvas/70 px-6 py-10 sm:px-8">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{detail}</p>
      {adminHref && (
        <Link
          href={adminHref}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-bhumi hover:text-bhumi-dark"
        >
          Manage content <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}
