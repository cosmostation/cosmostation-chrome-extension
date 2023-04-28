import { useRecoilState } from 'recoil';

import { extensionSessionStorageState } from '~/Popup/recoils/extensionSessionStorage';
import { setSessionStorage } from '~/Popup/utils/extensionSessionStorage';
import type { ExtensionSessionStorage, ExtensionSessionStorageKeys } from '~/types/extensionStorage';

export function useExtensionSessionStorage() {
  const [extensionSessionStorage, setExtensionSessionStorage] = useRecoilState(extensionSessionStorageState);

  const setStorage =
    process.env.BROWSER === 'chrome'
      ? setSessionStorage
      : async <T extends ExtensionSessionStorageKeys>(key: T, value: ExtensionSessionStorage[T]) => {
          const sessionStorage = await setSessionStorage(key, value);
          setExtensionSessionStorage(sessionStorage as ExtensionSessionStorage);
        };

  return { extensionSessionStorage, setExtensionSessionStorage: setStorage };
}
