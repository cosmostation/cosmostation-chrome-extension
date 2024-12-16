import type { ExtensionSessionStorage, ExtensionSessionStorageKeys } from '../extension';

export interface ExtensionSessionStorageState extends ExtensionSessionStorage {}

export type ExtensionSessionStorageActions = {
  updateExtensionSessionStorageStore<T extends ExtensionSessionStorageKeys>(key: T, value: ExtensionSessionStorage[T]): void;
  resetExtensionSessionStorageStore(): void;
};

export type ExtensionSessionStorageStore = ExtensionSessionStorageState & ExtensionSessionStorageActions;
