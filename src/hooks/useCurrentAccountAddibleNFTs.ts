import { useMemo } from 'react';

import { useAccountAddibleCosmosNFTsWithMeta } from './cosmos/nft/useAccountAddibleCosmosNFTsWithMeta';
import { useCurrentAddedSuiNFTsWithMetaData } from './sui/useCurrentAddedSuiNFTsWithMetaData';

type UseCurrentAccountAddibleNFTsProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddibleNFTs({ accountId }: UseCurrentAccountAddibleNFTsProps = {}) {
  const { allSuiNFTsWithMeta, isLoading: isSuiLoading } = useCurrentAddedSuiNFTsWithMetaData({ accountId });
  const { allCosmosNFTsWithMeta, isLoading: isCosmosLoading } = useAccountAddibleCosmosNFTsWithMeta({ accountId });

  const currentAccountAddibleNFTs = useMemo(() => {
    return {
      sui: allSuiNFTsWithMeta,
      cosmos: allCosmosNFTsWithMeta,
    };
  }, [allCosmosNFTsWithMeta, allSuiNFTsWithMeta]);

  const isLoading = useMemo(() => {
    return isSuiLoading || isCosmosLoading;
  }, [isCosmosLoading, isSuiLoading]);

  return { currentAccountAddibleNFTs, isLoading };
}
