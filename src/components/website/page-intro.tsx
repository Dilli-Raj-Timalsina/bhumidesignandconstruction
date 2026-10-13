import {
  pageIntroDefaults,
  type PageIntroKey,
  type PageIntros,
} from "@/features/content/page-intros";

export function PageIntro({
  page,
  intro,
}: {
  page: PageIntroKey;
  intro: PageIntros[PageIntroKey];
}) {
  const { eyebrow, label } = pageIntroDefaults[page];
  const isTool =
    page === "tools" || page.endsWith("Calculator") || page === "areaConverter";
  if (!intro.title && !intro.subtitle) {
    return <h1 className="sr-only">{label}</h1>;
  }

  return (
    <section
      className={`border-b border-line bg-canvas ${isTool ? "py-14 md:py-20" : "py-16 md:py-24"}`}
    >
      <div className="site-shell">
        <p className="eyebrow">{eyebrow}</p>
        {intro.title ? (
          <h1
            className={`display-title ${isTool ? "mt-5 max-w-4xl" : "mt-6 max-w-5xl"}`}
          >
            {intro.title}
          </h1>
        ) : (
          <h1 className="sr-only">{label}</h1>
        )}
        {intro.subtitle && (
          <p
            className={
              isTool
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
