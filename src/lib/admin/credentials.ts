import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

import type { ConfiguredAdminCredentials } from "./config";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

/**
 * Compare fixed-length digests so failed logins do not reveal which part of a
 * configured credential was wrong through a timing difference.
 */
export function matchesConfiguredAdminCredentials(
  email: string,
  password: string,
  configured: ConfiguredAdminCredentials,
) {
  // Do both fixed-length comparisons before combining the result. `&&` would
  // short-circuit after a bad email and make the password path observable.
  const emailMatches = safeEqual(email.trim().toLowerCase(), configured.email);
  const passwordMatches = safeEqual(password, configured.password);
  return emailMatches && passwordMatches;
}
