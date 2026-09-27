"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-xl border border-red-200 bg-white p-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-700">
        Admin error
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">
        This content could not be loaded.
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Check your connection and permissions, then try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-10 bg-bhumi px-4 text-sm font-semibold text-white hover:bg-bhumi-dark"
      >
        Try again
      </button>
    </section>
  );
}
