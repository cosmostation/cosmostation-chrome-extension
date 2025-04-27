import { produce } from 'immer';
import { create } from 'zustand';

import type { PortfolioFilterChainIdState, PortfolioFilterChainIdStore } from '@/types/store/portfolioFilterChainId';

const initialState: PortfolioFilterChainIdState = {
  chainId: undefined,
};

export const usePortfolioFilterChainIdStore = create<PortfolioFilterChainIdStore>()((set) => ({
  ...initialState,
  updateChainId: async (newValue) => {
    set((state) =>
      produce(state, (draft) => {
        draft.chainId = newValue;
      }),
    );
  },
}));
