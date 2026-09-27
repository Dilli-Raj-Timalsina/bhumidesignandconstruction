import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type ServiceListItem = {
  title: string;
  slug: string;
  shortDescription?: string | null;
};

export function ServiceList({ services }: { services: ServiceListItem[] }) {
  return (
    <div className="border-t border-line">
      {services.map((service, index) => (
        <Link
          href={`/services#${service.slug}`}
          key={service.slug}
          className="group grid gap-3 border-b border-line py-6 transition-colors hover:bg-bhumi-light/45 sm:grid-cols-[56px_minmax(0,1fr)_minmax(190px,0.85fr)_28px] sm:items-center sm:px-3 sm:py-7"
        >
          <span className="text-xs font-bold tracking-[0.08em] text-bhumi">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-xl font-semibold tracking-[-0.035em] text-ink md:text-2xl">
            {service.title}
          </h3>
          <p className="text-sm leading-6 text-muted">
            {service.shortDescription}
          </p>
          <ArrowUpRight
            size={20}
            className="justify-self-end text-ink transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-bhumi"
          />
        </Link>
      ))}
    </div>
  );
}
