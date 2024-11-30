import { create } from 'zustand';

import { DefaultSortKey } from '@/constants/initialStorage';
import type { SortKeyStore } from '@/types/store/sortKey';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

const initialState = DefaultSortKey;

export const useSortKeyStore = create<SortKeyStore>()((set) => ({
  ...initialState,
  updateDashboardCoinSortKey: async (newDashboardSortKey) => {
    await setExtensionLocalStorage('dashboardCoinSortKey', newDashboardSortKey);

    set(() => ({ dashboardCoinSortKey: newDashboardSortKey }));
  },
  updateDappListSortKey: async (newDappListSortKey) => {
    await setExtensionLocalStorage('dappListSortKey', newDappListSortKey);

    set(() => ({ dappListSortKey: newDappListSortKey }));
  },
}));

export const loadSortKeyStoreFromStorage = async () => {
  const dappListSortKey = await getExtensionLocalStorage('dappListSortKey');
  const dashboardCoinSortKey = await getExtensionLocalStorage('dashboardCoinSortKey');

  if (dappListSortKey) {
    useSortKeyStore.setState({
      dappListSortKey,
      dashboardCoinSortKey,
    });
  }
};
