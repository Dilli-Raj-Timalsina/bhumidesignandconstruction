export const projectStages = ["completed", "ongoing", "upcoming"] as const;

export type ProjectStage = (typeof projectStages)[number];

export const projectStageLabels: Record<ProjectStage, string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  upcoming: "Upcoming",
};

export function readProjectStage(value: unknown): ProjectStage | null {
  return projectStages.find((stage) => stage === value) ?? null;
}
