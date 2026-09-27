import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";

import { createServiceRoleClient } from "@/lib/supabase/server";

import {
  isConfiguredAdminEmail,
  type ConfiguredAdminCredentials,
} from "./config";

export type AdminLoginAttempt = {
  allowed: boolean;
  retryAfterSeconds: number;
  subjects: string[];
};

function clientAddress(requestHeaders: Headers): string {
  // Only prefer headers that are normally overwritten by a managed edge. An
  // arbitrary X-Forwarded-For value is attacker-controlled on many hosts.
  return (
    requestHeaders.get("x-vercel-forwarded-for")?.trim() ||
    requestHeaders.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

function subjectHash(
  type: "account" | "ip",
  value: string,
  secret: string,
): string {
  const digest = createHmac("sha256", secret)
    .update(`${type}:${value}`)
    .digest("hex");
  return `${type}:${digest}`;
}

function resultFromRpc(
  data: { allowed: boolean; retry_after_seconds: number }[] | null,
): Omit<AdminLoginAttempt, "subjects"> {
  const result = data?.[0];
  if (
    !result ||
    typeof result.allowed !== "boolean" ||
    !Number.isFinite(result.retry_after_seconds)
  ) {
    throw new Error("The admin login rate limiter returned an invalid result.");
  }
  return {
    allowed: result.allowed,
    retryAfterSeconds: Math.max(0, Math.floor(result.retry_after_seconds)),
  };
}

/**
 * Consumes one login attempt before the credential comparison. The database
 * serializes the counters, so the limit works across serverless instances.
 */
export async function consumeAdminLoginAttempt(
  email: string,
  configured: ConfiguredAdminCredentials,
): Promise<AdminLoginAttempt> {
  const requestHeaders = await headers();
  const subjects = [
    subjectHash(
      "ip",
      clientAddress(requestHeaders),
      configured.rateLimitSecret,
    ),
  ];

  // Only create a global account bucket for the configured address. This
  // prevents attackers from filling the rate-limit table with arbitrary
  // email-derived records while still limiting a rotating-IP attack.
  if (isConfiguredAdminEmail(email)) {
    subjects.push(
      subjectHash("account", configured.email, configured.rateLimitSecret),
    );
  }

  const service = createServiceRoleClient();
  const { data, error } = await service.rpc("consume_admin_login_attempt", {
    p_subjects: subjects,
  });
  if (error) throw new Error("The admin login rate limiter is unavailable.");

  return { ...resultFromRpc(data), subjects };
}

export async function clearAdminLoginAttempts(subjects: string[]) {
  const service = createServiceRoleClient();
  const { error } = await service.rpc("clear_admin_login_attempts", {
    p_subjects: subjects,
  });
  if (error) throw new Error("The admin login rate limiter is unavailable.");
}
