import {
  pageIntroDefaults,
  type PageIntroKey,
  type PageIntros,
} from "@/features/content/page-intros";

export function PageIntro({
  page,
  intro,
  compact = false,
}: {
  page: PageIntroKey;
  intro: PageIntros[PageIntroKey];
  compact?: boolean;
}) {
  const { label } = pageIntroDefaults[page];
  const { eyebrow } = intro;
  const isTool =
    page === "tools" || page.endsWith("Calculator") || page === "areaConverter";
  if (!intro.title && !intro.subtitle) {
    return <h1 className="sr-only">{label}</h1>;
  }

  return (
    <section
      className={`border-b border-line bg-canvas ${compact ? "py-9 md:py-12" : isTool ? "py-14 md:py-20" : "py-16 md:py-24"}`}
    >
      <div className="site-shell">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {intro.title ? (
          <h1
            className={
              compact
                ? "mt-4 max-w-4xl text-[clamp(2rem,3.7vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.05em] text-ink"
                : `display-title ${isTool ? "mt-5 max-w-4xl" : "mt-6 max-w-5xl"}`
            }
          >
            {intro.title}
          </h1>
        ) : (
          <h1 className="sr-only">{label}</h1>
        )}
        {intro.subtitle && (
          <p
            className={
              compact
                ? "mt-4 max-w-3xl text-sm leading-6 text-muted md:text-base"
                : isTool
                  ? "mt-5 max-w-2xl text-base leading-8 text-muted md:text-lg"
                  : "mt-7 max-w-2xl text-lg leading-8 text-muted"
            }
          >
            {intro.subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
