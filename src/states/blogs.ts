import { create } from "zustand";

// Import types
import type { BlogType } from "src/objects/blogs/types";

type BlogsState = {
  blogs: Array<BlogType> | null;
};
type UseBlogsActions = {
  setBlogs(data: Array<BlogType> | null): void;
  reset(): void;
};

const initialState = {
  blogs: null,
};

export const useBlogsState = create<BlogsState & UseBlogsActions>((set) => {
  return {
    ...initialState,

    /**
     * Use to set project
     * @param data
     */
    setBlogs(data) {
      set((state) => {
        return {
          ...state,
          blogs: data,
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
