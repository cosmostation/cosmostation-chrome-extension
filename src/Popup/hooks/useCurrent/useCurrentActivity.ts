import { useMemo } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { equal } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { ActivityType } from '~/types/extensionStorage';

import { useCurrentAccount } from './useCurrentAccount';
import { useCurrentAptosNetwork } from './useCurrentAptosNetwork';
import { useCurrentChain } from './useCurrentChain';
import { useCurrentEthereumNetwork } from './useCurrentEthereumNetwork';
import { useCurrentSuiNetwork } from './useCurrentSuiNetwork';
import { useAccounts } from '../SWR/cache/useAccounts';

export function useCurrentActivity() {
  const { currentAccount } = useCurrentAccount();

  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { currentSuiNetwork } = useCurrentSuiNetwork();
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { activity } = extensionStorage;

  const accounts = useAccounts();

  const currentAddress = useMemo(
    () => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentChain.id, currentAccount.id],
  );

  const baseChainUUID = useMemo(() => {
    if (currentChain.line === 'COSMOS') {
      return currentChain.id;
    }
    if (currentChain.line === 'ETHEREUM') {
      return currentEthereumNetwork.id;
    }
    if (currentChain.line === 'SUI') {
      return currentSuiNetwork.id;
    }
    if (currentChain.line === 'APTOS') {
      return currentAptosNetwork.id;
    }
    return '';
  }, [currentAptosNetwork.id, currentChain.id, currentChain.line, currentEthereumNetwork.id, currentSuiNetwork.id]);

  const currentActivitiy = useMemo(() => [...(activity?.[baseChainUUID]?.[currentAddress] || [])], [activity, currentAddress, baseChainUUID]);

  const setCurrentActivity = async (txHash: string, type?: ActivityType) => {
    const newActivity = {
      baseChainUUID,
      txHash,
      timestamp: String(Date.now()),
      address: currentAddress,
      type,
    };

    const newCurrentActivities = currentActivitiy?.find(
      (item) =>
        isEqualsIgnoringCase(item.baseChainUUID, baseChainUUID) &&
        isEqualsIgnoringCase(item.txHash, txHash) &&
        isEqualsIgnoringCase(item.address, currentAddress),
    )
      ? currentActivitiy
      : [...currentActivitiy, newActivity];

    const trimmedCurrentActivities =
      newCurrentActivities.length > 10
        ? newCurrentActivities.filter((item) => !equal(item.timestamp, Math.min(...newCurrentActivities.map((activityItem) => Number(activityItem.timestamp)))))
        : newCurrentActivities;

    const updatedActivity = {
      ...activity,
      [baseChainUUID]: {
        ...activity?.[baseChainUUID],
        [currentAddress]: trimmedCurrentActivities,
      },
    };

    await setExtensionStorage('activity', updatedActivity);
  };

  return { currentActivitiy, setCurrentActivity };
}
