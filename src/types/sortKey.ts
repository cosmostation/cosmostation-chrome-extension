import type { DAPP_LIST_SORT_KEY, DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';

export type DashboardCoinSortKeyType = ValueOf<typeof DASHBOARD_COIN_SORT_KEY>;

export type DappListSortKeyType = ValueOf<typeof DAPP_LIST_SORT_KEY>;

export type CommonSortKeyType = DashboardCoinSortKeyType | DappListSortKeyType;
