import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

import { getSupabaseConfig, hasSupabaseEnv } from "./config";

const ADMIN_LOGIN_PATH = "/admin/login";

function isProtectedAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    (pathname.startsWith("/admin/") && pathname !== ADMIN_LOGIN_PATH)
  );
}

function redirectToLogin(
  request: NextRequest,
  response: NextResponse,
  reason?: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = ADMIN_LOGIN_PATH;
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  if (reason) url.searchParams.set("reason", reason);

  const redirectResponse = NextResponse.redirect(url);
  response.cookies
    .getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

/**
 * Refreshes the Supabase session and blocks non-admin access to `/admin/*`.
 * Local static work can render without fake credentials; a production
 * deployment with missing credentials still redirects protected admin routes.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const protectedAdminPath = isProtectedAdminPath(request.nextUrl.pathname);

  if (!hasSupabaseEnv()) {
    if (protectedAdminPath && process.env.NODE_ENV === "production") {
      return redirectToLogin(request, response, "configuration");
    }
    return response;
  }

  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!protectedAdminPath) return response;
  if (!user) return redirectToLogin(request, response);
  if (!user.email_confirmed_at)
    return redirectToLogin(request, response, "restricted");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin)
    return redirectToLogin(request, response, "restricted");
  return response;
}
