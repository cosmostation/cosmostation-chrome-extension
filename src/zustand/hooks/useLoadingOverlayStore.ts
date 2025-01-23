import { produce } from 'immer';
import { create } from 'zustand';

import type { LoadingOverlayState, LoadingOverlayStore } from '@/types/store/loadingOverlay';

const initialState: LoadingOverlayState = {
  loading: false,
};

export const useLoadingOverlayStore = create<LoadingOverlayStore>()((set) => ({
  ...initialState,
  updateLoadingOverlay: async (newState) => {
    set((state) =>
      produce(state, (draft) => {
        draft.loading = newState;
      }),
    );
  },
}));
