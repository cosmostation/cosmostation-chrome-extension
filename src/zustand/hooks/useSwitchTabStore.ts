import { produce } from 'immer';
import { create } from 'zustand';

import type { SwitchTapState, SwitchTapStore } from '@/types/store/switchTap';

const initialState: SwitchTapState = {
  manageAccountTapIndex: 0,
};

export const useSwitchTapStore = create<SwitchTapStore>()((set) => ({
  ...initialState,
  updatedManateAccountTabIndex: async (newTabIndex) => {
    set((state) =>
      produce(state, (draft) => {
        draft.manageAccountTapIndex = newTabIndex;
      }),
    );
  },
}));
