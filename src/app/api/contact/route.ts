import { NextResponse } from "next/server";

import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/validations/contact";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Please submit the form again." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { message: "Please check the form fields and try again." },
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  if (typeof record.website === "string" && record.website.trim()) {
    // A successful no-op response makes the honeypot less useful to bots.
    return NextResponse.json({ ok: true });
  }

  const { website: _website, ...input } = record;
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.issues[0]?.message ??
          "Please check the form fields and try again.",
      },
      { status: 400 },
    );
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        message:
          "The inquiry inbox is not configured yet. Please try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert(parsed.data);
    if (error) {
      console.error("Contact message insert failed", { code: error.code });
      return NextResponse.json(
        { message: "Your message could not be sent. Please try again." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(
      "Contact request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { message: "Your message could not be sent. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
