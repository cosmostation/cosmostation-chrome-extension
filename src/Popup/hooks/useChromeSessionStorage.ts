import { useRecoilValue } from 'recoil';

import { chromeSessionStorageState } from '~/Popup/recoils/chromeSessionStorage';
import { setSessionStorage } from '~/Popup/utils/chromeSessionStorage';

export function useChromeSessionStorage() {
  const chromeSessionStorage = useRecoilValue(chromeSessionStorageState);

  return { chromeSessionStorage, setChromeSessionStorage: setSessionStorage };
}
