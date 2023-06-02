import { useRecoilValue } from 'recoil';

import { extensionStorageState } from '~/Popup/recoils/extensionStorage';
import { setStorage } from '~/Popup/utils/extensionStorage';

export function useExtensionStorage() {
  const extensionStorage = useRecoilValue(extensionStorageState);

  return { extensionStorage, setExtensionStorage: setStorage };
}
