"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#f6f8fb] p-6 font-sans text-[#1e1e1e]">
        <div className="max-w-md border border-[#e4e7ec] bg-white p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2958b1]">
            Something went wrong
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            We could not load this page.
          </h1>
          <p className="mt-4 leading-7 text-[#667085]">
            Please try again. If the problem persists, return to the home page.
          </p>
          <div className="mt-7 flex gap-3">
            <button
              className="bg-[#2958b1] px-4 py-2.5 text-sm font-semibold text-white"
              onClick={reset}
            >
              Try again
            </button>
            <Link
              className="border border-[#e4e7ec] px-4 py-2.5 text-sm font-semibold"
              href="/"
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
