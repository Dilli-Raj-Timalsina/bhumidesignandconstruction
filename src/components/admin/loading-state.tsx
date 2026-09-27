export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex min-h-48 items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span
        className="size-5 animate-spin border-2 border-slate-200 border-t-bhumi"
        aria-hidden="true"
      />
      <span className="ml-3 text-sm text-slate-600">{label}…</span>
    </div>
  );
}
