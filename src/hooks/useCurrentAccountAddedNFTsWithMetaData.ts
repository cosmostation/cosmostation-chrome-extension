import { useMemo } from 'react';

import { useCurrentAddedCosmosNFTsWithMetaData } from './cosmos/nft/useCurrentAddedCosmosNFTsWithMetaData';
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
  const { addedCosmosNFTsWithMeta, isLoading: isLoadingCosmsoNFTs } = useCurrentAddedCosmosNFTsWithMetaData({ accountId });

  const currentAccountAddNFTsWithMeta = useMemo(() => {
    const addedSuiNFTs = [...addedSuiNFTsWithMeta];
    const addedEVMNFTs = [...addedEVMNFTsWithMeta];
    const addedCosmosNFTs = [...addedCosmosNFTsWithMeta];

    return {
      sui: addedSuiNFTs,
      evm: addedEVMNFTs,
      cosmos: addedCosmosNFTs,
      flat: [...addedSuiNFTs, ...addedEVMNFTs, ...addedCosmosNFTs],
    };
  }, [addedCosmosNFTsWithMeta, addedEVMNFTsWithMeta, addedSuiNFTsWithMeta]);

  const isLoading = useMemo(() => {
    return isLoadingSuiNFTs || isLoadingEVMNFTs || isLoadingCosmsoNFTs;
  }, [isLoadingCosmsoNFTs, isLoadingEVMNFTs, isLoadingSuiNFTs]);

  return { currentAccountAddNFTsWithMeta, isLoading };
}
