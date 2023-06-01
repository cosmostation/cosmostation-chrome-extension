import { useRecoilValue } from 'recoil';

import { extensionSessionStorageState } from '~/Popup/recoils/extensionSessionStorage';
import { setSessionStorage } from '~/Popup/utils/extensionSessionStorage';

export function useExtensionSessionStorage() {
  const extensionSessionStorage = useRecoilValue(extensionSessionStorageState);

  return { extensionSessionStorage, setExtensionSessionStorage: setSessionStorage };
}
