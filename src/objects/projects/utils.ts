// Import types
import type { TechStackType } from "../techstacks/types";
import type { ProjectType } from "./types";

export class ProjectUtils {
  /**
   * Use to get date as string by project format
   * @param dateNum
   * @returns
   */
  static toProjectDateStr(dateNum: number) {
    const date = new Date(dateNum);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  /**
   * Use to merge techstacks with projects
   * @param projects
   * @param techStacks
   */
  static mergeTechStacks(
    projects: Array<ProjectType>,
    techStacks: Array<TechStackType>
  ) {
    for (const project of projects) {
      for (const techStackRef of project.techStacks) {
        const actualTechStack = techStacks.find(
          (techStack) => techStack.value === techStackRef.value
        );
        for (let i = 0; i < techStackRef.data.length; i++) {
          techStackRef.data[i] = actualTechStack?.data.find(
            (tech) => tech.id === techStackRef.data[i].id
          )!;
        }
      }
    }

    return projects;
  }
}
