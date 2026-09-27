import "server-only";

type ConfiguredAdminCredentials = {
  email: string;
  password: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function configuredEmail() {
  return process.env.ADMIN_EMAIL?.trim() || "";
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Reads the single administrator identity from server-only environment values.
 * The password is never exposed to a client component or returned to callers.
 */
export function getConfiguredAdminCredentials(): ConfiguredAdminCredentials {
  const email = normalizeEmail(configuredEmail());
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!emailPattern.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  }

  return { email, password };
}

export function hasConfiguredAdminCredentials(): boolean {
  try {
    getConfiguredAdminCredentials();
    return true;
  } catch {
    return false;
  }
}

/** Login also needs the existing server-only Supabase key for the rate limit. */
export function hasAdminServerConfiguration(): boolean {
  return (
    hasConfiguredAdminCredentials() &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  );
}

/** Safe for request guards: the configured login ID is not a secret. */
export function isConfiguredAdminEmail(value: string | null | undefined) {
  if (!value) return false;
  try {
    return normalizeEmail(value) === getConfiguredAdminCredentials().email;
  } catch {
    return false;
  }
}

export type { ConfiguredAdminCredentials };
