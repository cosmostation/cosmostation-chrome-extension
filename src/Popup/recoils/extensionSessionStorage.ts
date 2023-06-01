import { atom } from 'recoil';

import type { ChromeSessionStorage } from '~/types/extensionStorage';

export const extensionSessionStorageDefault: ChromeSessionStorage = {
  password: null,
};

export const extensionSessionStorageState = atom<ChromeSessionStorage>({
  key: 'extensionSessionStorageState',
  default: extensionSessionStorageDefault,
});
