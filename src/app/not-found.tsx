import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <section className="max-w-lg border border-line bg-white p-8 md:p-12">
        <p className="eyebrow">404</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-ink">
          This page is not part of the plan.
        </h1>
        <p className="mt-5 leading-7 text-muted">
          The page may have moved, or its content is not yet published.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex border border-ink px-5 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
