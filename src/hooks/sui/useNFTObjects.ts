import { useCallback, useMemo } from 'react';
import type { SuiObjectDataOptions, SuiObjectResponse } from '@mysten/sui/client';

import { getObjectDisplay, isKiosk } from '@/utils/sui/nft';

import { useGetDynamicFields } from './useGetDynamicFields';
import { useGetObjects } from './useGetObjects';
import { useGetObjectsOwnedByAddress } from './useGetObjectsOwnedByAddress';
import type { UseFetchConfig } from '../common/useFetch';

type UseNFTObjectsProps = {
  coinId: string;
  options?: SuiObjectDataOptions;
  config?: UseFetchConfig;
};

export function useNFTObjects({ coinId, options, config }: UseNFTObjectsProps) {
  const { data: objectsOwnedByAddress, refetch: refetchGetObjectsByOwnedAddress } = useGetObjectsOwnedByAddress({
    coinId,
    queryOptions: {
      options: options,
    },
    config,
  });

  const objectIdList = useMemo(
    () =>
      objectsOwnedByAddress?.reduce((acc: string[], item) => {
        const objectIds = item.result?.data.map((dataItem) => dataItem.data?.objectId || '') || [];
        return [...acc, ...objectIds];
      }, []) || [],
    [objectsOwnedByAddress],
  );

  const { data: objects, refetch: refetchGetObjects } = useGetObjects({
    coinId,
    objectIds: objectIdList,
    options: {
      ...options,
      showType: true,
      showContent: true,
      showOwner: true,
      showDisplay: true,
    },
    config,
  });

  const nftObjects = useMemo(() => {
    const suiObjectResponses = objects
      ?.reduce((acc: SuiObjectResponse[], item) => (item && item.result ? [...acc, ...item.result] : acc), [])
      .filter((item) => item);

    return suiObjectResponses?.filter((item) => getObjectDisplay(item)?.data) || [];
  }, [objects]);

  const kioskObject = useMemo(() => nftObjects.find((item) => item.data && isKiosk(item.data)), [nftObjects]);

  const kioskObjectParentId = useMemo(() => (kioskObject ? getObjectDisplay(kioskObject)?.data?.kiosk : ''), [kioskObject]);

  const { data: kioskObjectDynamicFields, refetch: refetchGetDynamicFields } = useGetDynamicFields({
    coinId,
    parentObjectId: kioskObjectParentId,
    config,
  });

  const kioskDynamicFieldsObjectIds = useMemo(
    () =>
      kioskObjectDynamicFields?.reduce((acc: string[], item) => {
        const objectIds = item.result?.data.map((dataItem) => dataItem.objectId || '') || [];
        return [...acc, ...objectIds];
      }, []) || [],
    [kioskObjectDynamicFields],
  );

  const { data: kioskObjects, refetch: refetchGetKioskObjects } = useGetObjects({
    coinId,
    objectIds: kioskDynamicFieldsObjectIds,
    options: {
      ...options,
      showType: true,
      showContent: true,
      showOwner: true,
      showDisplay: true,
    },
    config,
  });

  const kioskNFTObjects = useMemo(() => {
    const suiKioskObjectResponses = kioskObjects
      ? kioskObjects.reduce((acc: SuiObjectResponse[], item) => (item && item.result ? [...acc, ...item.result] : acc), []).filter((item) => item)
      : [];

    return suiKioskObjectResponses.filter((item) => getObjectDisplay(item)?.data) || [];
  }, [kioskObjects]);

  const ownedNFTObjects = useMemo(() => [...kioskNFTObjects, ...nftObjects], [kioskNFTObjects, nftObjects]);

  const refetchNFTObjects = useCallback(() => {
    void refetchGetObjectsByOwnedAddress();
    void refetchGetObjects();
    void refetchGetDynamicFields();
    void refetchGetKioskObjects();
  }, [refetchGetDynamicFields, refetchGetKioskObjects, refetchGetObjects, refetchGetObjectsByOwnedAddress]);

  return { nftObjects: ownedNFTObjects, refetchNFTObjects };
}
