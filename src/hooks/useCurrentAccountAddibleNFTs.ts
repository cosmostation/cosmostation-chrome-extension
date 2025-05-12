import { useMemo } from 'react';

import { useAccountAddibleCosmosNFTsWithMeta } from './cosmos/nft/useAccountAddibleCosmosNFTsWithMeta';
import { useCurrentAddedIotaNFTsWithMetaData } from './iota/useCurrentAddedIotaNFTsWithMetaData';
import { useCurrentAddedSuiNFTsWithMetaData } from './sui/useCurrentAddedSuiNFTsWithMetaData';

type UseCurrentAccountAddibleNFTsProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddibleNFTs({ accountId }: UseCurrentAccountAddibleNFTsProps = {}) {
  const { allSuiNFTsWithMeta, isLoading: isSuiLoading } = useCurrentAddedSuiNFTsWithMetaData({ accountId });
  const { allIotaNFTsWithMeta, isLoading: isIotaLoading } = useCurrentAddedIotaNFTsWithMetaData({ accountId });
  const { allCosmosNFTsWithMeta, isLoading: isCosmosLoading } = useAccountAddibleCosmosNFTsWithMeta({ accountId });

  const currentAccountAddibleNFTs = useMemo(() => {
    return {
      sui: allSuiNFTsWithMeta,
      cosmos: allCosmosNFTsWithMeta,
      iota: allIotaNFTsWithMeta,
    };
  }, [allCosmosNFTsWithMeta, allIotaNFTsWithMeta, allSuiNFTsWithMeta]);

  const isLoading = useMemo(() => {
    return isSuiLoading || isCosmosLoading || isIotaLoading;
  }, [isCosmosLoading, isIotaLoading, isSuiLoading]);

  return { currentAccountAddibleNFTs, isLoading };
}
