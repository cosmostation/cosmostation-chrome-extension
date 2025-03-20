import { useMemo } from 'react';

import { useCurrentAddedEVMNFTsWithMetaData } from './evm/nft/useCurrentAddedEVMNFTsWithMetaData';
import { useCurrentAddedSuiNFTsWithMetaData } from './sui/useCurrentAddedSuiNFTsWithMetaData';

type UseCurrentAccountAddedNFTsWithMetaDataProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddedNFTsWithMetaData({ accountId }: UseCurrentAccountAddedNFTsWithMetaDataProps = {}) {
  const { addedSuiNFTsWithMeta, isLoading: isLoadingSuiNFTs } = useCurrentAddedSuiNFTsWithMetaData({ accountId });
  const { addedEVMNFTsWithMeta, isLoading: isLoadingEVMNFTs } = useCurrentAddedEVMNFTsWithMetaData({ accountId });

  const currentAccountAddNFTsWithMeta = useMemo(() => {
    const addedSuiNFTs = [...addedSuiNFTsWithMeta];
    const addedEVMNFTs = [...addedEVMNFTsWithMeta];

    return {
      sui: addedSuiNFTs,
      evm: addedEVMNFTs,
      flat: [...addedSuiNFTs, ...addedEVMNFTs],
    };
  }, [addedEVMNFTsWithMeta, addedSuiNFTsWithMeta]);

  const isLoading = useMemo(() => {
    return isLoadingSuiNFTs || isLoadingEVMNFTs;
  }, [isLoadingEVMNFTs, isLoadingSuiNFTs]);

  return { currentAccountAddNFTsWithMeta, isLoading };
}
