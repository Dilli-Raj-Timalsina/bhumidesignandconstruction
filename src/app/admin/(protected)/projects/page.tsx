import Link from "next/link";
import { ExternalLink, Pencil, Search } from "lucide-react";

import { deleteProjectAction } from "@/app/actions/admin";
import { getAdminProjects } from "@/components/admin/admin-data";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";

type ProjectsPageProps = { searchParams: Promise<{ q?: string | string[] }> };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const query = first((await searchParams).q);
  const projects = await getAdminProjects(query);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage case studies and their public visibility."
        action={{ href: "/admin/projects/new", label: "New project" }}
      />
      <form className="mb-5 flex max-w-md gap-2" role="search">
        <label htmlFor="project-search" className="sr-only">
          Search projects
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="project-search"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search projects"
            className="min-h-10 w-full border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          className="min-h-10 border border-line px-4 text-sm font-semibold text-ink hover:bg-white"
        >
          Search
        </button>
      </form>
      {projects.length ? (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-xs font-semibold uppercase tracking-[0.09em] text-muted">
              <tr>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Visibility</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="font-semibold text-ink hover:text-bhumi"
                    >
                      {project.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted">/{project.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {project.category ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {project.sortOrder}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-bhumi hover:text-bhumi-dark"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                      {project.status === "published" ? (
                        <Link
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-ink"
                        >
                          <ExternalLink className="size-3.5" />
                          View
                        </Link>
                      ) : null}
                      <ConfirmDialog
                        trigger={
                          <button
                            type="button"
                            className="text-sm font-semibold text-red-700 hover:text-red-800"
                          >
                            Delete
                          </button>
                        }
                        title="Delete project?"
                        description="This permanently removes the project and its associated image records."
                        action={deleteProjectAction}
                        values={{ id: project.id }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={query ? "No matching projects" : "No projects yet"}
          description={
            query
              ? "Try a different search term, or clear the search to view all projects."
              : "Create a project to begin building the public portfolio."
          }
          action={
            !query
              ? { href: "/admin/projects/new", label: "Create project" }
              : undefined
          }
        />
      )}
    </div>
  );
}
