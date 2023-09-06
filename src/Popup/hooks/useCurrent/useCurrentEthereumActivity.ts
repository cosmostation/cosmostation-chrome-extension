import { useMemo } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';

import { useCurrentAccount } from './useCurrentAccount';
import { useCurrentEthereumNetwork } from './useCurrentEthereumNetwork';
import { useAccounts } from '../SWR/cache/useAccounts';

export function useCurrentActivity() {
  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { activity } = extensionStorage;
  const accounts = useAccounts();

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentEthereumNetwork.id] || '',
    [accounts?.data, currentEthereumNetwork.id, currentAccount.id],
  );

  const currentActivity = useMemo(
    () => activity.filter((item) => isEqualsIgnoringCase(item.baseChainUUID, currentEthereumNetwork.id) && isEqualsIgnoringCase(item.address, currentAddress)),
    [activity, currentAddress, currentEthereumNetwork.id],
  );

  const setCurrentActivity = async (txHash: string) => {
    // NOTE 기존 데이터는 유지한채로 새로 들어올 데이터의 검증만 하면 됨
    const baseActivity = {
      baseChainUUID: currentEthereumNetwork.id,
      txHash,
      timestamp: String(Date.now()),
      address: currentAddress,
    };

    const newActivities = activity.find(
      (item) =>
        isEqualsIgnoringCase(item.baseChainUUID, currentEthereumNetwork.id) &&
        isEqualsIgnoringCase(item.txHash, txHash) &&
        isEqualsIgnoringCase(item.address, currentAddress),
    )
      ? activity
      : [...activity, baseActivity];

    await setExtensionStorage('activity', newActivities);
  };

  return { currentActivity, setCurrentActivity };
}
