import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import { SubmitButton } from "./submit-button";

type FieldLabelProps = {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
};

function FieldLabel({ label, name, hint, required }: FieldLabelProps) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={name} className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-red-700">*</span> : null}
      </label>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  required,
  className = "",
  ...props
}: FieldLabelProps & InputHTMLAttributes<HTMLInputElement>) {
  const fieldName = props.name ?? "";
  return (
    <div className={className}>
      <FieldLabel
        label={label}
        name={fieldName}
        hint={hint}
        required={required}
      />
      <input
        {...props}
        id={props.id ?? fieldName}
        required={required}
        className="min-h-10 w-full border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-bhumi focus:outline-none disabled:bg-slate-50"
      />
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  required,
  className = "",
  ...props
}: FieldLabelProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldName = props.name ?? "";
  return (
    <div className={className}>
      <FieldLabel
        label={label}
        name={fieldName}
        hint={hint}
        required={required}
      />
      <textarea
        {...props}
        id={props.id ?? fieldName}
        required={required}
        className="min-h-28 w-full resize-y border border-line bg-white px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-slate-400 focus:border-bhumi focus:outline-none"
      />
    </div>
  );
}

export function SelectField({
  label,
  hint,
  required,
  name,
  defaultValue,
  children,
  className = "",
}: FieldLabelProps & {
  defaultValue?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel label={label} name={name} hint={hint} required={required} />
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="min-h-10 w-full border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-bhumi focus:outline-none"
      >
        {children}
      </select>
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked = false,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line bg-white px-4 py-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded-none border-line text-bhumi focus:ring-bhumi"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint ? (
          <span className="mt-1 block text-xs leading-5 text-muted">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function FormActions({
  cancelHref,
  submitLabel = "Save changes",
}: {
  cancelHref: string;
  submitLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
      <a
        href={cancelHref}
        className="inline-flex min-h-10 items-center justify-center border border-line px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-50"
      >
        Cancel
      </a>
      <SubmitButton pendingLabel="Saving">{submitLabel}</SubmitButton>
    </div>
  );
}
