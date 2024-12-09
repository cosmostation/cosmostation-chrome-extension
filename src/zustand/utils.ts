import { loadExtensionStorageStoreFromStorage } from './hooks/useExtensionStorageStore';

export async function loadAllStoreFromStorage() {
  await loadExtensionStorageStoreFromStorage();
}
