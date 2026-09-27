"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { ReactElement } from "react";

type FormAction = (formData: FormData) => void | Promise<void>;

export function ConfirmDialog({
  trigger,
  title,
  description,
  action,
  values,
  confirmLabel = "Delete",
}: {
  trigger: ReactElement;
  title: string;
  description: string;
  action: FormAction;
  values: Record<string, string>;
  confirmLabel?: string;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-line bg-white p-6 shadow-xl focus:outline-none">
          <AlertDialog.Title className="text-lg font-semibold tracking-[-0.03em] text-ink">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted">
            {description}
          </AlertDialog.Description>
          <form
            action={action}
            className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
          >
            {Object.entries(values).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="min-h-10 border border-line px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <button
              type="submit"
              className="min-h-10 bg-red-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-800"
            >
              {confirmLabel}
            </button>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
