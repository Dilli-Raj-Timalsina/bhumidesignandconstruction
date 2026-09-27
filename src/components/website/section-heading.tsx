import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "grid gap-7 md:grid-cols-2 md:gap-12",
        align === "right" && "md:[&>div:first-child]:order-2",
        className,
      )}
    >
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title mt-5">{title}</h2>
      </div>
      {description && (
        <div className="self-end text-base leading-8 text-muted md:max-w-md">
          {description}
        </div>
      )}
    </div>
  );
}
