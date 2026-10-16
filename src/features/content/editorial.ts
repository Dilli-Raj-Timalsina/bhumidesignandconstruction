import { z } from "zod";

import { companyHighlights, processSteps } from "./marketing";

export const processIconNames = [
  "consultation",
  "design",
  "estimation",
  "construction",
  "quality",
  "handover",
] as const;

const copy = (max = 500) => z.string().trim().max(max);
const titledCard = z
  .object({ title: copy(160).min(1), description: copy(800).min(1) })
  .strict();

export const editorialContentSchema = z
  .object({
    headerCta: copy(80),
    whatsappGreeting: copy(500),
    servicesPageCta: copy(80),
    projectsPageCta: copy(80),
    serviceEnquiryCta: copy(80),
    homeHeroEyebrow: copy(120),
    homePrimaryCta: copy(80),
    homeSecondaryCta: copy(80),
    homeScrollLabel: copy(80),
    highlights: z
      .array(
        z.object({ value: copy(60).min(1), label: copy(120).min(1) }).strict(),
      )
      .max(8),
    practiceEyebrow: copy(120),
    practiceCards: z.array(titledCard).max(8),
    homeAboutEyebrow: copy(120),
    homeAboutCta: copy(80),
    homeServicesEyebrow: copy(120),
    homeServicesTitle: copy(240),
    homeServicesDescription: copy(800),
    homeServicesCta: copy(80),
    homeProjectsEyebrow: copy(120),
    homeProjectsTitle: copy(240),
    homeProjectsCta: copy(80),
    homeGalleryEyebrow: copy(120),
    homeGalleryTitle: copy(240),
    homeGalleryCta: copy(80),
    aboutPracticeEyebrow: copy(120),
    aboutPracticeCta: copy(80),
    capacityEyebrow: copy(120),
    capacityTitle: copy(240),
    capacityDescription: copy(800),
    capacityCards: z.array(titledCard).max(8),
    processEyebrow: copy(120),
    processTitle: copy(240),
    processDescription: copy(800),
    processSteps: z
      .array(titledCard.extend({ icon: z.enum(processIconNames) }).strict())
      .max(12),
    contactEyebrow: copy(120),
    contactTitle: copy(240),
    contactDescription: copy(800),
    ctaEyebrow: copy(120),
    ctaTitle: copy(240),
    ctaDescription: copy(800),
    ctaButton: copy(80),
    emiRateNote: copy(1_000),
  })
  .strict();

export type EditorialContent = z.infer<typeof editorialContentSchema>;

/** Existing public copy is retained until an administrator reviews and saves it. */
export const editorialDefaults: EditorialContent = {
  headerCta: "Start a project",
  whatsappGreeting:
    "Hello BHUMI Design & Construction, I would like to discuss a project.",
  servicesPageCta: "Discuss a project",
  projectsPageCta: "Have a project in mind?",
  serviceEnquiryCta: "Enquire",
  homeHeroEyebrow: "Civil engineering + construction",
  homePrimaryCta: "View projects",
  homeSecondaryCta: "Contact us",
  homeScrollLabel: "Scroll to explore",
  highlights: companyHighlights.map(({ value, label }) => ({ value, label })),
  practiceEyebrow: "Our practice",
  practiceCards: [
    {
      title: "Civil engineering-led",
      description:
        "Founded and led by Er. Shashiram Nakal, a Pulchowk Campus civil engineering graduate.",
    },
    {
      title: "Built to execute",
      description:
        "Civil and structural work spanning RCC, masonry, foundations, and substation civil works.",
    },
    {
      title: "On-site capacity",
      description:
        "Three site supervisors / overseers and approximately 40 workers across running sites.",
    },
  ],
  homeAboutEyebrow: "About BHUMI",
  homeAboutCta: "About Bhumi",
  homeServicesEyebrow: "Services",
  homeServicesTitle: "From first sketch\nto final handover.",
  homeServicesDescription:
    "Practical support for every stage of your project — from early advice and design through construction, quality checks, and handover.",
  homeServicesCta: "Explore services",
  homeProjectsEyebrow: "Selected work",
  homeProjectsTitle: "Work in progress. Work delivered.",
  homeProjectsCta: "All projects",
  homeGalleryEyebrow: "In the field",
  homeGalleryTitle: "A closer look at the work.",
  homeGalleryCta: "Open gallery",
  aboutPracticeEyebrow: "The practice",
  aboutPracticeCta: "Talk about your project",
  capacityEyebrow: "Current capacity",
  capacityTitle: "Built for active,\non-site delivery.",
  capacityDescription:
    "Organizational capacity documented in the supplied company portfolio.",
  capacityCards: [
    {
      title: "Er. Shashiram Nakal",
      description:
        "Founder / MD / CEO; civil engineering graduate of Pulchowk Campus, Institute of Engineering.",
    },
    {
      title: "3 site supervisors / overseers",
      description: "Currently deployed across active sites.",
    },
    {
      title: "Approx. 40 workers",
      description: "Across running sites in the portfolio snapshot.",
    },
    {
      title: "6 running sites",
      description:
        "Current active-site count documented in BHUMI’s company portfolio.",
    },
  ],
  processEyebrow: "How we work",
  processTitle: "Our process",
  processDescription:
    "A practical outline of how project work is discussed, planned, executed, and handed over.",
  processSteps: processSteps.map(({ icon, title, description }) => ({
    icon,
    title,
    description,
  })),
  contactEyebrow: "Start a conversation",
  contactTitle: "Start with the scope.",
  contactDescription:
    "Share your requirements and the team will respond using the details below.",
  ctaEyebrow: "Start a conversation",
  ctaTitle: "Planning your next project?",
  ctaDescription: "Let's discuss how we can build it.",
  ctaButton: "Start a conversation",
  emiRateNote: "",
};

/** A missing database column or unsaved value keeps the existing public copy. */
export function readEditorialContent(value: unknown): EditorialContent {
  const saved =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const parsed = editorialContentSchema.safeParse({
    ...editorialDefaults,
    ...saved,
  });
  return parsed.success ? parsed.data : editorialDefaults;
}
