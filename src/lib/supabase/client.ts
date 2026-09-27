"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseConfig, hasSupabaseEnv } from "./config";

let browserClient: SupabaseClient<Database> | undefined;

/**
 * Returns the singleton browser client. It validates environment variables at
 * call time so pages that do not use Supabase can still render without them.
 */
export function createClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const { url, anonKey } = getSupabaseConfig();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}

export { hasSupabaseEnv };
