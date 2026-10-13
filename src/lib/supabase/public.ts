import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseConfig } from "./config";

/** Public reads use the anon key and RLS, with no visitor or admin cookies. */
export function createPublicClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient<Database>(url, anonKey, {
    global: {
      // The surrounding Next data cache is the single source of caching.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
