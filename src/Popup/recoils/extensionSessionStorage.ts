import { atom } from 'recoil';

import type { ExtensionSessionStorage } from '~/types/extensionStorage';

export const extensionSessionStorageDefault: ExtensionSessionStorage = {
  password: null,
};

export const extensionSessionStorageState = atom<ExtensionSessionStorage>({
  key: 'extensionSessionStorageState',
  default: extensionSessionStorageDefault,
});
