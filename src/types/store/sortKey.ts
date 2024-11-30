import type { DappListSortKeyType, DashboardCoinSortKeyType } from '../sortKey';

export type SortKeyState = {
  dashboardCoinSortKey: DashboardCoinSortKeyType;
  dappListSortKey: DappListSortKeyType;
};

export type SortKeyStateActions = {
  updateDashboardCoinSortKey: (sortKey: SortKeyState['dashboardCoinSortKey']) => void;
  updateDappListSortKey: (sortKey: SortKeyState['dappListSortKey']) => void;
};

export type SortKeyStore = SortKeyState & SortKeyStateActions;
