import { useMemo } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { equal } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { ActivityType } from '~/types/extensionStorage';

import { useCurrentAccount } from './useCurrentAccount';
import { useCurrentChain } from './useCurrentChain';
import { useAccounts } from '../SWR/cache/useAccounts';

export function useCurrentCosmosActivity() {
  const { currentAccount } = useCurrentAccount();
  const { currentChain } = useCurrentChain();
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { activity } = extensionStorage;

  const accounts = useAccounts();

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentChain.id, currentAccount.id],
  );

  const currentCosmosActivities = useMemo(() => [...(activity?.[currentChain.id]?.[currentAddress] || [])], [activity, currentAddress, currentChain.id]);

  const setCurrentCosmosActivity = async (txHash: string, type?: ActivityType) => {
    const newActivity = {
      baseChainUUID: currentChain.id,
      txHash,
      timestamp: String(Date.now()),
      address: currentAddress,
      type,
    };

    const newCurrentCosmosActivities = currentCosmosActivities.find(
      (item) =>
        isEqualsIgnoringCase(item.baseChainUUID, currentChain.id) &&
        isEqualsIgnoringCase(item.txHash, txHash) &&
        isEqualsIgnoringCase(item.address, currentAddress),
    )
      ? currentCosmosActivities
      : [...currentCosmosActivities, newActivity];

    const trimmedCurrentCosmosActivities =
      newCurrentCosmosActivities.length > 10
        ? newCurrentCosmosActivities.filter(
            (obj) => !equal(obj.timestamp, Math.min(...newCurrentCosmosActivities.map((activityItem) => Number(activityItem.timestamp)))),
          )
        : newCurrentCosmosActivities;

    const updatedActivity = {
      ...activity,
      [currentChain.id]: {
        ...activity?.[currentChain.id],
        [currentAddress]: trimmedCurrentCosmosActivities,
      },
    };

    await setExtensionStorage('activity', updatedActivity);
  };

  return { currentCosmosActivities, setCurrentCosmosActivity };
}
