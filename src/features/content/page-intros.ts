export const pageIntroDefaults = {
  about: {
    label: "About",
    eyebrow: "About BHUMI",
    title: "Engineering-led construction, from foundation to finish.",
    subtitle:
      "A civil engineering and construction practice delivering residential and institutional work.",
  },
  services: {
    label: "Services",
    eyebrow: "Services",
    title: "Civil construction with a practical point of view.",
    subtitle:
      "Turnkey residential delivery, civil and structural works, substation civil works, and supervised design and interior coordination.",
  },
  projects: {
    label: "Projects",
    eyebrow: "Projects",
    title: "Current work. Completed work. Built with care.",
    subtitle:
      "A documented portfolio of substation, residential, and structural construction work across Dang.",
  },
  gallery: {
    label: "Gallery",
    eyebrow: "Gallery",
    title: "The detail is in the work.",
    subtitle:
      "Project photography and proposal imagery, organized by the work documented in BHUMI's portfolio.",
  },
  insights: {
    label: "Insights",
    eyebrow: "Insights",
    title: "Updates from the work.",
    subtitle:
      "BHUMI will share project updates and construction notes here as they are approved for publication.",
  },
  contact: {
    label: "Contact",
    eyebrow: "Contact",
    title: "Let's discuss your project.",
    subtitle:
      "Reach BHUMI for civil engineering and construction requirements.",
  },
  tools: {
    label: "Tools",
    eyebrow: "BHUMI tools",
    title: "Practical calculators for your project.",
    subtitle:
      "Use these early-stage estimates to plan a project, understand local land units, and prepare for a more detailed discussion with the BHUMI team.",
  },
  brickCalculator: {
    label: "Brick calculator",
    eyebrow: "BHUMI tools",
    title: "Brick calculator",
    subtitle:
      "Estimate brick quantity and mortar volume for a masonry wall using common Nepal brick sizes.",
  },
  concreteCalculator: {
    label: "Concrete calculator",
    eyebrow: "BHUMI tools",
    title: "Concrete calculator",
    subtitle:
      "Estimate concrete materials from dimensions, nominal mix grade, and a practical wastage allowance.",
  },
  areaConverter: {
    label: "Area converter",
    eyebrow: "BHUMI tools",
    title: "Area converter",
    subtitle:
      "Instantly convert square feet, square metres, Ropani, Aana, Bigha, Kattha, Dhur, and more.",
  },
  emiCalculator: {
    label: "EMI calculator",
    eyebrow: "BHUMI tools",
    title: "EMI calculator",
    subtitle:
      "Plan an estimated monthly instalment, total interest, and total loan repayment in NPR.",
  },
} as const;

export type PageIntroKey = keyof typeof pageIntroDefaults;
export type PageIntros = Record<
  PageIntroKey,
  { title: string | null; subtitle: string | null }
>;

export const pageIntroKeys = Object.keys(pageIntroDefaults) as PageIntroKey[];

/** Missing keys retain the original copy; explicit nulls stay hidden. */
export function readPageIntros(value: unknown): PageIntros {
  const saved =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    pageIntroKeys.map((key) => {
      const entry = saved[key];
      const fields =
        entry && typeof entry === "object" && !Array.isArray(entry)
          ? (entry as Record<string, unknown>)
          : {};
      const defaults = pageIntroDefaults[key];
      return [
        key,
        {
          title:
            fields.title === null || typeof fields.title === "string"
              ? fields.title
              : defaults.title,
          subtitle:
            fields.subtitle === null || typeof fields.subtitle === "string"
              ? fields.subtitle
              : defaults.subtitle,
        },
      ];
    }),
  ) as PageIntros;
}
