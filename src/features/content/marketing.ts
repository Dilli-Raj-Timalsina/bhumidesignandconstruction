export const companyHighlights = [
  { value: "3", label: "Site supervisors (portfolio)" },
  { value: "~40", label: "Workers (portfolio)" },
  { value: "6", label: "Running sites (portfolio)" },
  { value: "5", label: "Documented projects" },
] as const;

export const processSteps = [
  {
    number: "01",
    title: "Consultation",
    description:
      "Discuss the site, scope, and project requirements with the client.",
    icon: "consultation",
  },
  {
    number: "02",
    title: "Design & Planning",
    description:
      "Coordinate design and planning needs with qualified specialist partners.",
    icon: "design",
  },
  {
    number: "03",
    title: "Estimation",
    description:
      "Review the proposed scope and cost estimate before work begins.",
    icon: "estimation",
  },
  {
    number: "04",
    title: "Construction",
    description:
      "Carry out agreed civil and structural work under BHUMI's supervision.",
    icon: "construction",
  },
  {
    number: "05",
    title: "Quality Check",
    description:
      "Review work against the agreed scope and relevant quality requirements.",
    icon: "quality",
  },
  {
    number: "06",
    title: "Handover",
    description:
      "Review the completed work and handover scope with the client.",
    icon: "handover",
  },
] as const;
