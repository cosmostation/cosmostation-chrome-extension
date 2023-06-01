import { useRecoilValue } from 'recoil';

import { chromeStorageState } from '~/Popup/recoils/chromeStorage';
import { setStorage } from '~/Popup/utils/extensionStorage';

export function useChromeStorage() {
  const chromeStorage = useRecoilValue(chromeStorageState);

  return { chromeStorage, setChromeStorage: setStorage };
}
