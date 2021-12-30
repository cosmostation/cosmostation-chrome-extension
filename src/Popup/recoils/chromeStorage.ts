import { atom } from 'recoil';

import { THEME_TYPE } from '~/constants/theme';
import type { ChromeStorage } from '~/types/chromeStorage';

export const chromeStorageState = atom<ChromeStorage>({
  key: 'chromeStorageState',
  default: {
    password: null,
    accounts: [],
    selectedAccountName: '',
    queues: [],
    theme: THEME_TYPE.LIGHT,
    windowId: null,
  },
});
