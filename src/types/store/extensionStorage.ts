import type { ExtensionStorage, ExtensionStorageKeys } from '../extension';

export interface ExtensionStorageState extends ExtensionStorage {}

export type ExtensionStorageActions = {
  updateExtensionStorageStore<T extends ExtensionStorageKeys>(key: T, value: ExtensionStorage[T]): void;
  resetExtensionStorageStore(): void;
};

export type ExtensionStorageStore = ExtensionStorageState & ExtensionStorageActions;
