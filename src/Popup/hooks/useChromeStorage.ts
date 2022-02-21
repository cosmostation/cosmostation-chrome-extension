import { useRecoilValue } from 'recoil';

import { chromeStorageState } from '~/Popup/recoils/chromeStorage';
import { setStorage } from '~/Popup/utils/chromeStorage';

export function useChromeStorage() {
  const chromeStorage = useRecoilValue(chromeStorageState);

  const addAllowedChain = async (accountId: string, chainId: string) => {
    const { allowedChains } = chromeStorage;

    if (allowedChains.find((chain) => chain.accountId === accountId && chain.chainId === chainId)) {
      return;
    }

    await setStorage('allowedChains', [...allowedChains, { accountId, chainId }]);
  };

  const removeAllowedChain = async (accountId: string, chainId: string) => {
    const { allowedChains } = chromeStorage;

    if (!allowedChains.find((chain) => chain.accountId === accountId && chain.chainId === chainId)) {
      return;
    }

    const newAllowedChains = JSON.parse(JSON.stringify(allowedChains)) as typeof allowedChains;

    for (let i = 0; i < newAllowedChains.filter((chain) => chain.accountId === accountId && chain.chainId === chainId).length; i += 1) {
      newAllowedChains.splice(
        newAllowedChains.findIndex((chain) => chain.accountId === accountId && chain.chainId === chainId),
        1,
      );
    }

    await setStorage('allowedChains', newAllowedChains);
  };

  return { chromeStorage, setChromeStorage: setStorage, addAllowedChain, removeAllowedChain };
}
