import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

// Match Next.js environment loading so the command works with the recommended
// .env.local file (and with hosting-provided environment variables).
nextEnv.loadEnvConfig(process.cwd());

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requiredEnvironmentValue(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function readConfiguredAdmin() {
  const email = requiredEnvironmentValue("ADMIN_EMAIL").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const rateLimitSecret = requiredEnvironmentValue("ADMIN_RATE_LIMIT_SECRET");

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

  return { email, password };
}

function maskedEmail(email) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}…@${domain}`;
}

async function synchronizeAdmin() {
  const url = requiredEnvironmentValue("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY");
  const configured = readConfiguredAdmin();

  try {
    new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data: existingUserId, error: lookupError } = await supabase.rpc(
    "configured_admin_user_id",
    { p_email: configured.email },
  );
  if (lookupError) {
    throw new Error(
      "Could not look up the configured administrator. Apply the latest Supabase migration first.",
    );
  }

  let user;
  if (existingUserId) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUserId,
      {
        password: configured.password,
        email_confirm: true,
      },
    );
    if (error || !data.user) {
      throw new Error("Could not update the configured administrator.");
    }
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: configured.email,
      password: configured.password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error("Could not create the configured administrator.");
    }
    user = data.user;
  }

  const { error: accessError } = await supabase.rpc(
    "configure_configured_admin_access",
    { p_user_id: user.id },
  );
  if (accessError) {
    throw new Error("Could not grant the configured administrator access.");
  }

  console.info(
    `Configured BHUMI administrator: ${maskedEmail(configured.email)}`,
  );
}

synchronizeAdmin().catch((error) => {
  console.error(
    error instanceof Error
      ? `Admin sync failed: ${error.message}`
      : "Admin sync failed.",
  );
  process.exitCode = 1;
});
