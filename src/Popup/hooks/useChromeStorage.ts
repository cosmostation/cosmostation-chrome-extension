import { useRecoilValue } from 'recoil';

import { chromeStorageState } from '~/Popup/recoils/chromeStorage';
import { setStorage } from '~/Popup/utils/chromeStorage';

export function useChromeStorage() {
  const chromeStorage = useRecoilValue(chromeStorageState);

  const addAllowedChainId = async (chainId: string) => {
    const { allowedChainIds } = chromeStorage;

    if (allowedChainIds.find((allowedChainId) => allowedChainId === chainId)) {
      return;
    }

    await setStorage('allowedChainIds', [...allowedChainIds, chainId]);
  };

  const removeAllowedChainId = async (chainId: string) => {
    const { allowedChainIds } = chromeStorage;

    if (!allowedChainIds.find((allowedChainId) => allowedChainId === chainId)) {
      return;
    }

    const newAllowedChainIds = allowedChainIds.slice();

    for (let i = 0; i < newAllowedChainIds.filter((newAllowedChainId) => newAllowedChainId === chainId).length; i += 1) {
      newAllowedChainIds.splice(
        newAllowedChainIds.findIndex((newAllowedChainId) => newAllowedChainId === chainId),
        1,
      );
    }

    await setStorage('allowedChainIds', newAllowedChainIds);
  };

  return { chromeStorage, setChromeStorage: setStorage, addAllowedChainId, removeAllowedChainId };
}
