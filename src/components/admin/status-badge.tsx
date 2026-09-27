import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneByStatus: Record<string, StatusTone> = {
  archived: "neutral",
  draft: "warning",
  new: "info",
  published: "success",
  read: "neutral",
};

const toneClasses: Record<StatusTone, string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const label = status?.trim() || "Not set";
  const tone = toneByStatus[label.toLowerCase()] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-xs font-semibold capitalize tracking-[0.01em]",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
