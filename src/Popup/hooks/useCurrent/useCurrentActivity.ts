import { useMemo } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { equal } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { Amount } from '~/types/cosmos/common';
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
    () => accounts?.data?.find((ac) => isEqualsIgnoringCase(ac.id, currentAccount.id))?.address?.[currentChain.id] || '',
    [accounts?.data, currentChain.id, currentAccount.id],
  );

  const currentNetworkId = useMemo(() => {
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

  const currentActivitiy = useMemo(
    () => [
      ...(activity
        .find((item) => isEqualsIgnoringCase(item.accountId, currentAccount.id))
        ?.activity[currentNetworkId]?.filter((item) => isEqualsIgnoringCase(item.address, currentAddress)) || []),
    ],
    [activity, currentAccount.id, currentAddress, currentNetworkId],
  );

  type SetCurrentActivityParams = {
    baseChainUUID: string;
    txHash: string;
    address: string;
    type?: ActivityType;
    amount?: Amount[];
    toAddress?: string;
  };

  const setCurrentActivity = async ({ baseChainUUID, txHash, address, type, amount, toAddress }: SetCurrentActivityParams) => {
    const selectedAddressActivities = [...(activity.find((item) => isEqualsIgnoringCase(item?.accountId, currentAccount.id))?.activity?.[baseChainUUID] || [])];

    const newActivity = {
      baseChainUUID,
      txHash,
      timestamp: String(Date.now()),
      address,
      type,
      amount,
      toAddress,
    };

    const newCurrentActivities = selectedAddressActivities.find(
      (item) =>
        isEqualsIgnoringCase(item.baseChainUUID, newActivity.baseChainUUID) &&
        isEqualsIgnoringCase(item.txHash, newActivity.txHash) &&
        isEqualsIgnoringCase(item.address, newActivity.address),
    )
      ? selectedAddressActivities
      : [...selectedAddressActivities, newActivity];

    const trimmedCurrentActivities =
      newCurrentActivities.length > 10
        ? newCurrentActivities.filter((item) => !equal(item.timestamp, Math.min(...newCurrentActivities.map((activityItem) => Number(activityItem.timestamp)))))
        : newCurrentActivities;

    const updatedActivities = activity.find((item) => isEqualsIgnoringCase(item.accountId, currentAccount.id))
      ? activity.map((item) => {
          if (isEqualsIgnoringCase(item?.accountId, currentAccount.id)) {
            return {
              ...item,
              activity: {
                ...item.activity,
                [baseChainUUID]: trimmedCurrentActivities,
              },
            };
          }
          return item;
        })
      : [
          ...activity,
          {
            accountId: currentAccount.id,
            activity: {
              ...activity.find((item) => isEqualsIgnoringCase(item?.accountId, currentAccount.id))?.activity,
              [baseChainUUID]: trimmedCurrentActivities,
            },
          },
        ];
    await setExtensionStorage('activity', updatedActivities);
  };

  return { currentActivitiy, setCurrentActivity };
}
