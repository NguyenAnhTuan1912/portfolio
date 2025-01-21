// Import types
import type { TechStackType } from "../techstacks/types";

export type ProjectDescriptionType = {
  short: string;
  long: string;
};

export type ProjectLinkType = {
  id: string;
  name: string;
  value: string;
};

export type ProjectType = {
  id: string;
  name: string;
  type: string;
  techStacks: Array<TechStackType>;
  description: ProjectDescriptionType;
  cover: string;
  images: Array<string>;
  links: Array<ProjectLinkType>;
  startDate: number;
  endDate: number;
};
