import { create } from "zustand";

// Import types
import type { ContactStackType } from "src/objects/contact/type";

type ContactsState = {
  contactStacks: Array<ContactStackType> | null;
};
type UseContactsActions = {
  setContactStacks(data: Array<ContactStackType> | null): void;
  reset(): void;
};

const initialState = {
  contactStacks: null,
};

export const useContactsState = create<ContactsState & UseContactsActions>(
  (set) => {
    return {
      ...initialState,

      /**
       * Use to set project
       * @param data
       */
      setContactStacks(data) {
        set((state) => {
          return {
            ...state,
            contactStacks: data,
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
