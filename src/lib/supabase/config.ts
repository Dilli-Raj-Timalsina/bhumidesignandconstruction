export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

const publicEnvironmentKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

/**
 * Raised only when code actually tries to create a Supabase client. Keeping
 * validation lazy lets static UI work locally before a Supabase project exists.
 */
export class SupabaseEnvironmentError extends Error {
  readonly missingKeys: readonly string[];

  constructor(message: string, missingKeys: readonly string[] = []) {
    super(message);
    this.name = "SupabaseEnvironmentError";
    this.missingKeys = missingKeys;
  }
}

function readEnvironmentValue(
  name: (typeof publicEnvironmentKeys)[number],
): string | undefined {
  // Keep public keys as direct references so Next.js can inline them in the
  // browser bundle. Dynamic `process.env[name]` access is not inlined by Next.
  const values = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  } as const;
  const value = values[name]?.trim();
  return value || undefined;
}

/** Returns true only when the public Supabase configuration is usable. */
export function hasSupabaseEnv(): boolean {
  try {
    getSupabaseConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads the public Supabase credentials lazily. This function is safe to import
 * from shared modules; it never reads or exposes the service-role credential.
 */
export function getSupabaseConfig(): SupabasePublicConfig {
  const url = readEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnvironmentValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const missingKeys = publicEnvironmentKeys.filter(
    (key) => !readEnvironmentValue(key),
  );

  if (missingKeys.length > 0 || !url || !anonKey) {
    throw new SupabaseEnvironmentError(
      `Supabase is not configured. Add ${missingKeys.join(" and ")} to .env.local.`,
      missingKeys,
    );
  }

  try {
    new URL(url);
  } catch {
    throw new SupabaseEnvironmentError(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.",
      ["NEXT_PUBLIC_SUPABASE_URL"],
    );
  }

  return { url, anonKey };
}
