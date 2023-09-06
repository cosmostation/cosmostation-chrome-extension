import { useMemo } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { ActivityType } from '~/types/extensionStorage';

import { useCurrentAccount } from './useCurrentAccount';
import { useCurrentEthereumNetwork } from './useCurrentEthereumNetwork';
import { useAccounts } from '../SWR/cache/useAccounts';

export function useCurrentCosmosActivity() {
  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { activity } = extensionStorage;

  const accounts = useAccounts();

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentEthereumNetwork.id] || '',
    [accounts?.data, currentEthereumNetwork.id, currentAccount.id],
  );

  const currentEthereumActivities = useMemo(
    () => activity?.[currentEthereumNetwork.id]?.[currentAddress] || [],
    [activity, currentAddress, currentEthereumNetwork.id],
  );

  const setCurrentCosmosActivity = async (txHash: string, type?: ActivityType) => {
    const newActivity = {
      baseChainUUID: currentEthereumNetwork.id,
      txHash,
      timestamp: String(Date.now()),
      address: currentAddress,
      type,
    };

    const newActivities = currentEthereumActivities?.find(
      (item) =>
        isEqualsIgnoringCase(item.baseChainUUID, currentEthereumNetwork.id) &&
        isEqualsIgnoringCase(item.txHash, txHash) &&
        isEqualsIgnoringCase(item.address, currentAddress),
    )
      ? currentEthereumActivities
      : [...(currentEthereumActivities || []), newActivity];

    const trimmedCurrentCosmosActivities = newActivities.length > 10 ? newActivities.slice(1) : newActivities;

    // const specificAccountActivities = newActivities.filter(
    //   (item) => item.baseChainUUID === baseActivity.baseChainUUID && item.address === baseActivity.address,
    // );

    // const trimmedActivities =
    //   specificAccountActivities.length > 10
    //     ? newActivities.filter((item) => !isEqualsIgnoringCase(specificAccountActivities[0].txHash, item.txHash))
    //     : newActivities;

    const updatedActivity = {
      ...activity,
      [currentEthereumNetwork.id]: {
        ...activity?.[currentEthereumNetwork.id],
        [currentAddress]: trimmedCurrentCosmosActivities,
      },
    };

    await setExtensionStorage('activity', updatedActivity);
  };

  return { currentEthereumActivities, setCurrentCosmosActivity };
}
