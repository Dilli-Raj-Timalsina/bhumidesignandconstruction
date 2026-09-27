import Link from "next/link";
import { LogIn } from "lucide-react";

import { loginAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/admin/submit-button";
import {
  hasAdminServerConfiguration,
  hasConfiguredAdminCredentials,
} from "@/lib/admin/config";
import { hasSupabaseEnv } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; reason?: string; next?: string }>;
};

const adminPathPattern = /^\/admin(?:\/[A-Za-z0-9._~-]+)*$/;

function safeAdminNext(value: string | undefined): string {
  if (
    !value ||
    !adminPathPattern.test(value) ||
    value.includes("\\") ||
    value.split("/").some((segment) => segment === "." || segment === "..") ||
    value === "/admin/login"
  ) {
    return "/admin/dashboard";
  }
  return value;
}

const errors: Record<string, string> = {
  credentials: "We could not sign you in with those credentials.",
  restricted:
    "This account is not authorized to access the administration area.",
  rate_limited:
    "Too many sign-in attempts. Please wait 15 minutes and try again.",
  unavailable:
    "Admin sign-in is temporarily unavailable. Please try again shortly.",
  setup:
    "One setup step remains: run npm run admin:sync after applying the Supabase migration.",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasSupabaseConfiguration = hasSupabaseEnv();
  const hasAdminCredentials = hasConfiguredAdminCredentials();
  const configured = hasSupabaseConfiguration && hasAdminServerConfiguration();
  const configurationMessage = !hasSupabaseConfiguration
    ? "Add your Supabase URL and publishable key to .env.local, then restart the server."
    : !hasAdminCredentials
      ? "Add ADMIN_EMAIL and ADMIN_PASSWORD to .env.local, then restart the server."
      : "Add SUPABASE_SERVICE_ROLE_KEY to .env.local, then restart the server.";
  const next = safeAdminNext(params.next);
  const error = params.error
    ? (errors[params.error] ?? "We could not sign you in. Please try again.")
    : params.reason
      ? params.reason === "configuration"
        ? configurationMessage
        : errors[params.reason]
      : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 py-10">
      <section className="w-full max-w-md border border-line bg-white p-6 sm:p-8">
        <Link
          href="/"
          className="inline-flex items-baseline gap-2"
          aria-label="Return to BHUMI website"
        >
          <span className="text-xl font-extrabold tracking-[-0.07em] text-bhumi">
            BHUMI
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            Admin
          </span>
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-ink">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Use an authorized administrator account to manage the website.
        </p>
        {error ? (
          <p
            role="alert"
            className="mt-5 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}
        <form action={loginAction} className="mt-7 space-y-5">
          <input type="hidden" name="next" value={next} />
          <fieldset
            disabled={!configured}
            className="space-y-5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-h-11 w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-bhumi focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-ink"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="min-h-11 w-full border border-line px-3 py-2.5 text-sm text-ink focus:border-bhumi focus:outline-none"
              />
            </div>
            <SubmitButton pendingLabel="Signing in" className="w-full gap-2">
              <LogIn className="size-4" aria-hidden="true" />
              Sign in
            </SubmitButton>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
