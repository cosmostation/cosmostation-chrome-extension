export interface PortfolioValueState {
  totalValue: string;
  hasAssets: boolean;
}

export type PortfolioValueActions = {
  setPortfolioValue: (totalValue: string, hasAssets: boolean) => void;
};

export type PortfolioValueStore = PortfolioValueState & PortfolioValueActions;
