import { loadExtensionSessionStorageStoreFromStorage } from './hooks/useExtensionSessionStorageStore';
import { loadExtensionStorageStoreFromStorage } from './hooks/useExtensionStorageStore';

export async function loadAllStoreFromStorage() {
  await loadExtensionStorageStoreFromStorage();
  await loadExtensionSessionStorageStoreFromStorage();
}
