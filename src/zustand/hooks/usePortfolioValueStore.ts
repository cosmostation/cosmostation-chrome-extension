import { create } from 'zustand';

import type { PortfolioValueState, PortfolioValueStore } from '@/types/store/portfolioValue';

const initialState: PortfolioValueState = {
  totalValue: '0',
  hasAssets: false,
};

export const usePortfolioValueStore = create<PortfolioValueStore>()((set) => ({
  ...initialState,
  setPortfolioValue: (totalValue, hasAssets) => {
    set({ totalValue, hasAssets });
  },
}));
