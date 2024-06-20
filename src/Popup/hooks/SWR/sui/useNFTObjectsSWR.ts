import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';
import type { SuiObjectResponse } from '@mysten/sui/client';

import { getObjectDisplay, isKiosk } from '~/Popup/utils/sui';
import type { SuiNetwork } from '~/types/chain';

import { useGetDynamicFieldsSWR } from './useGetDynamicFieldsSWR';
import { useGetObjectsOwnedByAddressSWR } from './useGetObjectsOwnedByAddressSWR';
import { useGetObjectsSWR } from './useGetObjectsSWR';
import { useCurrentAccount } from '../../useCurrent/useCurrentAccount';
import { useCurrentChain } from '../../useCurrent/useCurrentChain';
import { useAccounts } from '../cache/useAccounts';

type Options = {
  showType?: boolean;
  showContent?: boolean;
  showBcs?: boolean;
  showOwner?: boolean;
  showPreviousTransaction?: boolean;
  showStorageRebate?: boolean;
  showDisplay?: boolean;
};

type UseNFTObjectsSWRProps = {
  address?: string;
  network?: SuiNetwork;
  options?: Options;
};

export function useNFTObjectsSWR({ network, address, options }: UseNFTObjectsSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const { currentAccount } = useCurrentAccount();
  const accounts = useAccounts(true);

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const addr = useMemo(() => address || currentAddress, [address, currentAddress]);

  const { data: objectsOwnedByAddress, mutate: mutateGetObjectsOwnedByAddress } = useGetObjectsOwnedByAddressSWR({ address: addr, network }, config);

  const objectIdList = useMemo(
    () =>
      objectsOwnedByAddress?.reduce((acc: string[], item) => {
        const objectIds = item.result?.data.map((dataItem) => dataItem.data?.objectId || '') || [];
        return [...acc, ...objectIds];
      }, []) || [],
    [objectsOwnedByAddress],
  );

  const { data: objects, mutate: mutateGetObjects } = useGetObjectsSWR(
    {
      network,
      objectIds: objectIdList,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      },
      ...options,
    },
    config,
  );

  const nftObjects = useMemo(() => {
    const suiObjectResponses = objects
      ?.reduce((acc: SuiObjectResponse[], item) => (item && item.result ? [...acc, ...item.result] : acc), [])
      .filter((item) => item);

    return suiObjectResponses?.filter((item) => getObjectDisplay(item)?.data) || [];
  }, [objects]);

  const kioskObject = useMemo(() => nftObjects.find((item) => item.data && isKiosk(item.data)), [nftObjects]);

  const kioskObjectParentId = useMemo(() => (kioskObject ? getObjectDisplay(kioskObject)?.data?.kiosk : ''), [kioskObject]);

  const { data: kioskObjectDynamicFields, mutate: mutateGetDynamicFields } = useGetDynamicFieldsSWR(
    {
      network,
      parentObjectId: kioskObjectParentId,
    },
    config,
  );

  const kioskDynamicFieldsObjectIds = useMemo(
    () =>
      kioskObjectDynamicFields?.reduce((acc: string[], item) => {
        const objectIds = item.result?.data.map((dataItem) => dataItem.objectId || '') || [];
        return [...acc, ...objectIds];
      }, []) || [],
    [kioskObjectDynamicFields],
  );

  const { data: kioskObjects, mutate: mutateGetKioskObjects } = useGetObjectsSWR(
    {
      network,
      objectIds: kioskDynamicFieldsObjectIds,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
        showDisplay: true,
      },
      ...options,
    },
    config,
  );

  const kioskNFTObjects = useMemo(() => {
    const suiKioskObjectResponses = kioskObjects
      ? kioskObjects.reduce((acc: SuiObjectResponse[], item) => (item && item.result ? [...acc, ...item.result] : acc), []).filter((item) => item)
      : [];

    return suiKioskObjectResponses.filter((item) => getObjectDisplay(item)?.data) || [];
  }, [kioskObjects]);

  const ownedNFTObjects = useMemo(() => [...kioskNFTObjects, ...nftObjects], [kioskNFTObjects, nftObjects]);

  const mutateNFTObjects = useCallback(() => {
    void mutateGetObjectsOwnedByAddress();
    void mutateGetObjects();
    void mutateGetDynamicFields();
    void mutateGetKioskObjects();
  }, [mutateGetObjectsOwnedByAddress, mutateGetObjects, mutateGetDynamicFields, mutateGetKioskObjects]);

  return { nftObjects: ownedNFTObjects, mutateNFTObjects };
}
