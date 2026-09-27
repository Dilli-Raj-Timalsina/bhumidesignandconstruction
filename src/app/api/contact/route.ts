import { type NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/validations/contact";

const maximumContactBodyBytes = 64 * 1024;

function response(message: string, status: number) {
  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function success(status = 200) {
  return NextResponse.json(
    { ok: true },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === request.nextUrl.origin);
}

async function readJsonPayload(
  request: NextRequest,
): Promise<{ payload: unknown } | { error: NextResponse }> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { error: response("Use a JSON form submission.", 415) };
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const length = Number(declaredLength);
    if (!Number.isSafeInteger(length) || length < 0) {
      return { error: response("Please submit the form again.", 400) };
    }
    if (length > maximumContactBodyBytes) {
      return { error: response("The form submission is too large.", 413) };
    }
  }

  const reader = request.body?.getReader();
  if (!reader) return { error: response("Please submit the form again.", 400) };

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumContactBodyBytes) {
        await reader.cancel().catch(() => undefined);
        return { error: response("The form submission is too large.", 413) };
      }
      chunks.push(value);
    }
  } catch {
    return { error: response("Please submit the form again.", 400) };
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { payload: JSON.parse(new TextDecoder().decode(body)) };
  } catch {
    return { error: response("Please submit the form again.", 400) };
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return response("This form can only be submitted from this website.", 403);
  }

  const parsedBody = await readJsonPayload(request);
  if ("error" in parsedBody) return parsedBody.error;
  const body = parsedBody.payload;

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return response("Please check the form fields and try again.", 400);
  }

  const record = body as Record<string, unknown>;
  if (typeof record.website === "string" && record.website.trim()) {
    // A successful no-op response makes the honeypot less useful to bots.
    return success();
  }

  const { website: _website, ...input } = record;
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) {
    return response(
      parsed.error.issues[0]?.message ??
        "Please check the form fields and try again.",
      400,
    );
  }

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return response(
      "The inquiry inbox is not configured yet. Please try again later.",
      503,
    );
  }

  try {
    // Public clients never receive this key. It is used only after origin,
    // payload-size, honeypot, and Zod checks, so anonymous REST writes can be
    // disabled by the accompanying database migration.
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert(parsed.data);
    if (error?.code === "P0001") {
      return response(
        "Please wait a few minutes before sending another inquiry.",
        429,
      );
    }
    if (error) {
      console.error("Contact message insert failed", { code: error.code });
      return response("Your message could not be sent. Please try again.", 500);
    }
  } catch (error) {
    console.error(
      "Contact request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return response("Your message could not be sent. Please try again.", 500);
  }

  return success(201);
}
