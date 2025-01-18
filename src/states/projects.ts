import { create } from "zustand";

// Import types
import type { ProjectType } from "src/objects/projects/types";

type ProjectsState = {
  projects: Array<ProjectType> | null;
};
type UseProjectsActions = {
  setProjects(data: Array<ProjectType> | null): void;
  reset(): void;
};

const initialState = {
  projects: null,
};

export const useProjectsState = create<ProjectsState & UseProjectsActions>(
  (set) => {
    return {
      ...initialState,

      /**
       * Use to set project
       * @param data
       */
      setProjects(data) {
        set((state) => {
          return {
            ...state,
            projects: data,
          };
        });
      },

      /**
       * Reset all state
       */
      reset() {
        set((state) => {
          return {
            ...state,
            ...initialState,
          };
        });
      },
    };
  }
);
