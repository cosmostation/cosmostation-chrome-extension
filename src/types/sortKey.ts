import type { CHAINLIST_SORT_KEY, COIN_SELECT_SORT_KEY, DAPP_LIST_SORT_KEY, DAPPS_SORT_KEY, DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';

export type DashboardCoinSortKeyType = ValueOf<typeof DASHBOARD_COIN_SORT_KEY>;

export type DappListSortKeyType = ValueOf<typeof DAPP_LIST_SORT_KEY>;

export type CoinSelectSortKeyType = ValueOf<typeof COIN_SELECT_SORT_KEY>;

export type DappsSortKeyType = ValueOf<typeof DAPPS_SORT_KEY>;

export type ChainlistSortKeyType = ValueOf<typeof CHAINLIST_SORT_KEY>;

export type CommonSortKeyType = DashboardCoinSortKeyType | DappListSortKeyType | CoinSelectSortKeyType | DappsSortKeyType | ChainlistSortKeyType;
