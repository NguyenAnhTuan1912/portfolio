import { create } from "zustand";

// Import types
import type { TechStackType } from "src/objects/techstacks/types";

type TechStacksState = {
  techStacks: Array<TechStackType> | null;
};
type UseTechStacksActions = {
  setTechStacks(data: Array<TechStackType> | null): void;
  reset(): void;
};

const initialState = {
  techStacks: null,
};

export const useTechstacksState = create<
  TechStacksState & UseTechStacksActions
>((set) => {
  return {
    ...initialState,

    /**
     * Use to set techstack
     * @param data
     */
    setTechStacks(data) {
      set((state) => {
        return {
          ...state,
          techStacks: data,
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
});
