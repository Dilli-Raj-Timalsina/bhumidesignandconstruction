import { redirect } from "next/navigation";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  email?: string;
};

/**
 * Guards pages and mutations using the same admin flag that backs the RLS policies.
 * Authentication alone is intentionally not enough for CMS access.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  if (!hasSupabaseEnv()) redirect("/admin/login?reason=configuration");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin =
    profile && typeof profile === "object" && "is_admin" in profile
      ? profile.is_admin
      : false;

  if (error || isAdmin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login?reason=restricted");
  }

  return { id: user.id, email: user.email };
}
