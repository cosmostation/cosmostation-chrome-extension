import type { UniqueChainId } from '../chain';

export interface PortfolioFilterChainIdState {
  chainId?: UniqueChainId;
}

export type PortfolioFilterChainIdActions = {
  updateChainId: (progressValue: PortfolioFilterChainIdState['chainId']) => void;
};

export type PortfolioFilterChainIdStore = PortfolioFilterChainIdState & PortfolioFilterChainIdActions;
