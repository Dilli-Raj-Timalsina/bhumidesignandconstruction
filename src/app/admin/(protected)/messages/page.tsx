import { Archive, MailCheck, Search } from "lucide-react";

import {
  deleteContactMessageAction,
  updateContactMessageStatusAction,
} from "@/app/actions/admin";
import { getAdminMessages } from "@/components/admin/admin-data";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmitButton } from "@/components/admin/submit-button";

type MessagesPageProps = { searchParams: Promise<{ q?: string | string[] }> };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formattedDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "—"
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default async function MessagesPage({
  searchParams,
}: MessagesPageProps) {
  const query = first((await searchParams).q);
  const messages = await getAdminMessages(query);

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Review inquiries submitted through the contact form."
      />
      <form className="mb-5 flex max-w-md gap-2" role="search">
        <label htmlFor="message-search" className="sr-only">
          Search messages
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="message-search"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search name, email, or subject"
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
      {messages.length ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className="border border-line bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold tracking-[-0.02em] text-ink">
                      {message.name}
                    </h2>
                    <StatusBadge status={message.status} />
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="mt-1 inline-block text-sm text-bhumi hover:text-bhumi-dark"
                  >
                    {message.email}
                  </a>
                  {message.phone ? (
                    <p className="mt-1 text-sm text-muted">{message.phone}</p>
                  ) : null}
                </div>
                <time
                  className="text-xs text-muted"
                  dateTime={message.createdAt ?? undefined}
                >
                  {formattedDate(message.createdAt)}
                </time>
              </div>
              {message.subject ? (
                <p className="mt-5 text-sm font-semibold text-ink">
                  {message.subject}
                </p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {message.message}
              </p>
              <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end sm:justify-between">
                <form
                  action={updateContactMessageStatusAction}
                  className="flex flex-wrap items-end gap-2"
                >
                  <input type="hidden" name="id" value={message.id} />
                  <label
                    className="text-xs font-semibold text-muted"
                    htmlFor={`message-status-${message.id}`}
                  >
                    Status
                  </label>
                  <select
                    id={`message-status-${message.id}`}
                    name="status"
                    defaultValue={message.status}
                    className="min-h-10 border border-line bg-white px-3 text-sm text-ink"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
                  </select>
                  <SubmitButton pendingLabel="Updating">Update</SubmitButton>
                </form>
                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:${message.email}`}
                    className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-bhumi hover:text-bhumi-dark"
                  >
                    <MailCheck className="size-4" />
                    Reply
                  </a>
                  <ConfirmDialog
                    trigger={
                      <button
                        type="button"
                        className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800"
                      >
                        <Archive className="size-4" />
                        Delete
                      </button>
                    }
                    title="Delete message?"
                    description="This permanently removes the contact inquiry from the administration area."
                    action={deleteContactMessageAction}
                    values={{ id: message.id }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={query ? "No matching messages" : "No contact messages"}
          description={
            query
              ? "Try a different search term, or clear the search to view all inquiries."
              : "New inquiries from the website contact form will appear here."
          }
        />
      )}
    </div>
  );
}
