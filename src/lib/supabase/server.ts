import "server-only";

import { createServerClient } from "@supabase/ssr";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import {
  getSupabaseConfig,
  hasSupabaseEnv,
  SupabaseEnvironmentError,
} from "./config";

/**
 * Creates a request-scoped SSR client. Cookie writes are intentionally ignored
 * in Server Components; `middleware.ts` performs the durable refresh instead.
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot mutate cookies. Middleware refreshes them.
        }
      },
    },
  });
}

/**
 * For tightly scoped trusted server tasks only (for example, an audited
 * maintenance task). CMS requests should use `createClient()` and RLS.
 */
export function createServiceRoleClient(): SupabaseClient<Database> {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new SupabaseEnvironmentError(
      "SUPABASE_SERVICE_ROLE_KEY is required for a service-role client.",
      ["SUPABASE_SERVICE_ROLE_KEY"],
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export { hasSupabaseEnv, SupabaseEnvironmentError };
