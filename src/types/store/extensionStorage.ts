import type { StoreSyncedStorage, StoreSyncedStorageKeys } from '../extension';

export type ExtensionStorageActions = {
  updateExtensionStorageStore<T extends StoreSyncedStorageKeys>(key: T, value: StoreSyncedStorage[T]): void;
  resetExtensionStorageStore(): void;
};

export type ExtensionStorageStore = StoreSyncedStorage & ExtensionStorageActions;
