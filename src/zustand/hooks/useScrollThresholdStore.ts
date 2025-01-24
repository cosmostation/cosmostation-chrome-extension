import { produce } from 'immer';
import { create } from 'zustand';

import type { ScrollThresholdState, ScrollThresholdStore } from '@/types/store/scrollThreshold';

const initialState: ScrollThresholdState = {
  isThresholdExceeded: false,
};

export const useScrollThresholdStore = create<ScrollThresholdStore>()((set) => ({
  ...initialState,
  updateIsThresholdExceed: async (newState) => {
    set((state) =>
      produce(state, (draft) => {
        draft.isThresholdExceeded = newState;
      }),
    );
  },
}));
