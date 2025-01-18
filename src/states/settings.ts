import { create } from "zustand";

// Import utils
import { BrowserStorageUtils } from "src/utils/browser_storage";

type SettingsState = {
  theme: string;
};

type SettingsStateActions = {
  setTheme(theme: string): void;
  reset(): void;
};

const initialState = {
  theme: BrowserStorageUtils.getItem<string>("theme") || "light",
};

export const useSettingsState = create<SettingsState & SettingsStateActions>(
  (set) => {
    return {
      ...initialState,

      /**
       * Use to change theme
       * @param theme
       */
      setTheme(theme: string) {
        set((state) => ({
          ...state,
          theme,
        }));
      },

      /**
       * Use to reset state
       */
      reset() {
        set((state) => ({
          ...state,
          ...initialState,
        }));
      },
    };
  }
);
