import { create } from "zustand";

// Import types
import type { BlogType } from "src/objects/blogs/types";

type BlogsState = {
  blogs: Array<BlogType> | null;
  content: string | null;
};
type UseBlogsActions = {
  setBlogContent(content: string): void;
  setBlogs(data: Array<BlogType> | null): void;
  reset(): void;
};

const initialState = {
  blogs: null,
  content: null,
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
     * Use to set new content for blog, or just clear it
     * @param content
     */
    setBlogContent(content: string | null) {
      set((state) => {
        return {
          ...state,
          content,
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
