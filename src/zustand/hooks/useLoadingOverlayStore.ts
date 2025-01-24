import { produce } from 'immer';
import { create } from 'zustand';

import type { LoadingOverlayState, LoadingOverlayStore } from '@/types/store/loadingOverlay';

const initialState: LoadingOverlayState = {
  loading: false,
  title: '',
  message: '',
};

export const useLoadingOverlayStore = create<LoadingOverlayStore>()((set) => ({
  ...initialState,
  startLoadingOverlay: async (newTitle, newMessage) => {
    set((state) =>
      produce(state, (draft) => {
        draft.loading = true;
        draft.title = newTitle;
        draft.message = newMessage;
      }),
    );
  },
  stopLoadingOverlay: async () => {
    set((state) =>
      produce(state, (draft) => {
        draft.loading = false;
        draft.title = '';
        draft.message = '';
      }),
    );
  },
  updateTexts: async (newTitle, newMessage) => {
    set((state) =>
      produce(state, (draft) => {
        draft.title = newTitle;
        draft.message = newMessage;
      }),
    );
  },
}));
