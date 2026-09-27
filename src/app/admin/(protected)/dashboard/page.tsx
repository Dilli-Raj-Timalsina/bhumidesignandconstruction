import Link from "next/link";
import { ArrowUpRight, FolderKanban, Images, Mail } from "lucide-react";

import { getDashboardCounts } from "@/components/admin/admin-data";
import { AdminCard, PageHeader } from "@/components/admin/page-header";

const metrics = [
  {
    key: "projects",
    label: "Published projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    key: "images",
    label: "Gallery images",
    href: "/admin/gallery",
    icon: Images,
  },
  {
    key: "messages",
    label: "New messages",
    href: "/admin/messages",
    icon: Mail,
  },
] as const;

export default async function DashboardPage() {
  const counts = await getDashboardCounts();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An at-a-glance view of the content currently available to visitors."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ key, label, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className="group border border-line bg-white p-5 transition-colors hover:border-bhumi"
          >
            <div className="flex items-start justify-between gap-4">
              <Icon className="size-5 text-bhumi" aria-hidden="true" />
              <ArrowUpRight
                className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </div>
            <p className="mt-8 text-3xl font-semibold tracking-[-0.06em] text-ink">
              {counts[key]}
            </p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <AdminCard className="p-5">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">
            Content workflow
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Draft content stays private until it is explicitly published. Use
            the relevant section to create and maintain public content.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/projects/new"
              className="min-h-10 bg-bhumi px-4 py-2.5 text-sm font-semibold text-white hover:bg-bhumi-dark"
            >
              Add project
            </Link>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">
            Before publishing
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Check image descriptions, project facts, and contact details before
            making content visible on the public website.
          </p>
          <Link
            href="/admin/contact"
            className="mt-5 inline-flex text-sm font-semibold text-bhumi hover:text-bhumi-dark"
          >
            Review contact details{" "}
            <ArrowUpRight className="ml-1 size-4" aria-hidden="true" />
          </Link>
        </AdminCard>
      </div>
    </div>
  );
}
