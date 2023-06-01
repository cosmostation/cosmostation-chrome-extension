import { useRecoilValue } from 'recoil';

import { chromeSessionStorageState } from '~/Popup/recoils/extensionSessionStorage';
import { setSessionStorage } from '~/Popup/utils/extensionSessionStorage';

export function useChromeSessionStorage() {
  const chromeSessionStorage = useRecoilValue(chromeSessionStorageState);

  return { chromeSessionStorage, setChromeSessionStorage: setSessionStorage };
}
