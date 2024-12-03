import { loadCurrentAccountStoreFromStorage } from './hooks/useCurrentAccountStore';
import { loadSortKeyStoreFromStorage } from './hooks/useSortStore';

export async function loadAllStoreFromStorage() {
  await loadSortKeyStoreFromStorage();
  await loadCurrentAccountStoreFromStorage();
}
