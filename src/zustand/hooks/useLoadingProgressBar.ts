import { produce } from 'immer';
import { create } from 'zustand';

import type { LoadingProgressBarState, LoadingProgressBarStore } from '@/types/store/loadingProgressBar';

const initialState: LoadingProgressBarState = {
  progressValue: 0,
};

export const useLoadingProgressBarStore = create<LoadingProgressBarStore>()((set) => ({
  ...initialState,
  updateProgressValue: async (newProgressValue) => {
    set((state) =>
      produce(state, (draft) => {
        draft.progressValue = newProgressValue;
      }),
    );
  },
}));

export const setLoadingProgressBarStore = async (progressValue: number) => {
  const currentProgressValue = useLoadingProgressBarStore.getState().progressValue;

  if (currentProgressValue === progressValue) {
    return;
  }

  await useLoadingProgressBarStore.getState().updateProgressValue(progressValue);
};
