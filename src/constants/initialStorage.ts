import { CHAINLIST_SORT_KEY, DAPP_LIST_SORT_KEY, DASHBOARD_COIN_SORT_KEY } from './sortKey';

export const DefaultSortKey = {
  dashboardCoinSortKey: DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER,
  dappListSortKey: DAPP_LIST_SORT_KEY.ALPHABETICAL_ASC,
  chainListSortKey: CHAINLIST_SORT_KEY.VALUE_HIGH_ORDER,
} as const;
