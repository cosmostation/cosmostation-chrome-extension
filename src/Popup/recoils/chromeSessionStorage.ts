import { atom } from 'recoil';

import type { ChromeSessionStorage } from '~/types/chromeStorage';

export const chromeSessionStorageDefault: ChromeSessionStorage = {
  password: null,
};

export const chromeSessionStorageState = atom<ChromeSessionStorage>({
  key: 'chromeSessionStorageState',
  default: chromeSessionStorageDefault,
});
