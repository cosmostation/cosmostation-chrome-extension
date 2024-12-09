import { loadCurrentAccountStoreFromStorage } from './hooks/useCurrentAccountStore';
import { loadExtensionStorageStoreFromStorage } from './hooks/useExtensionStorageStore';
import { loadSortKeyStoreFromStorage } from './hooks/useSortStore';

export async function loadAllStoreFromStorage() {
  await loadSortKeyStoreFromStorage();
  await loadCurrentAccountStoreFromStorage();
  await loadExtensionStorageStoreFromStorage();
}
