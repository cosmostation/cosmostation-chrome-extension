import { useMemo } from 'react';

import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
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

  const currentCosmosActivity = useMemo(() => activity.filter((item) => item.baseChainUUID === currentChain.id), [activity, currentChain.id]);

  const setCurrentCosmosActivity = async (txHash: string, type?: ActivityType) => {
    const baseActivity = {
      baseChainUUID: currentChain.id,
      txHash,
      timestamp: String(Date.now()),
      address: currentAddress,
      type,
    };

    const newActivities = activity.find(
      (item) =>
        isEqualsIgnoringCase(item.baseChainUUID, currentChain.id) &&
        isEqualsIgnoringCase(item.txHash, txHash) &&
        isEqualsIgnoringCase(item.address, currentAddress),
    )
      ? activity
      : [...activity, baseActivity];

    const trimmedActivities = newActivities.length > 10 ? newActivities.slice(1) : newActivities;

    await setExtensionStorage('activity', trimmedActivities);
  };

  return { currentCosmosActivity, setCurrentCosmosActivity };
}
