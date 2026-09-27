"use client";

import { LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type FormStatus = { type: "idle" | "success" | "error"; message?: string };

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus({ type: "idle" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "Your message could not be sent. Please try again.";
        throw new Error(message);
      }
      form.reset();
      setStatus({
        type: "success",
        message: "Thank you — your inquiry has been received.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your message could not be sent. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-line bg-white p-6 sm:p-8"
      noValidate
    >
      <label className="sr-only" aria-hidden="true">
        Leave this field empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" autoComplete="name" required />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
        <Field label="Subject" name="subject" required />
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs font-semibold text-ink">
          How can we help?
        </span>
        <textarea
          name="message"
          rows={6}
          required
          className="w-full resize-y border border-line bg-white px-3.5 py-3 text-sm leading-6 text-ink placeholder:text-muted focus:border-bhumi"
          placeholder="Tell us a little about your project."
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex items-center gap-2 bg-bhumi px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-bhumi-dark disabled:cursor-not-allowed disabled:opacity-65"
      >
        {submitting ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}{" "}
        {submitting ? "Sending…" : "Send inquiry"}
      </button>
      {status.type !== "idle" && (
        <p
          role="status"
          className={
            status.type === "success"
              ? "mt-4 text-sm leading-6 text-emerald-700"
              : "mt-4 text-sm leading-6 text-red-700"
          }
        >
          {status.message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-ink">
        {label}
        {required && <span className="text-bhumi"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="w-full border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-muted focus:border-bhumi"
      />
    </label>
  );
}
