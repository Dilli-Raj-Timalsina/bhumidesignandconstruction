import "server-only";

type ConfiguredAdminCredentials = {
  email: string;
  password: string;
  rateLimitSecret: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function configuredValue(name: "ADMIN_EMAIL" | "ADMIN_RATE_LIMIT_SECRET") {
  return process.env[name]?.trim() || "";
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Reads the single administrator identity from server-only environment values.
 * The password is never exposed to a client component or returned to callers.
 */
export function getConfiguredAdminCredentials(): ConfiguredAdminCredentials {
  const email = normalizeEmail(configuredValue("ADMIN_EMAIL"));
  const password = process.env.ADMIN_PASSWORD ?? "";
  const rateLimitSecret = configuredValue("ADMIN_RATE_LIMIT_SECRET");

  if (!emailPattern.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (password.length < 16) {
    throw new Error("ADMIN_PASSWORD must contain at least 16 characters.");
  }
  if (rateLimitSecret.length < 32) {
    throw new Error(
      "ADMIN_RATE_LIMIT_SECRET must contain at least 32 characters.",
    );
  }

  return { email, password, rateLimitSecret };
}

export function hasConfiguredAdminCredentials(): boolean {
  try {
    getConfiguredAdminCredentials();
    return true;
  } catch {
    return false;
  }
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
