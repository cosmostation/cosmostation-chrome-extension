import { useMemo } from 'react';

import { useCurrentAddedCosmosNFTsWithMetaData } from './cosmos/nft/useCurrentAddedCosmosNFTsWithMetaData';
import { useCurrentAddedEVMNFTsWithMetaData } from './evm/nft/useCurrentAddedEVMNFTsWithMetaData';
import { useCurrentAddedIotaNFTsWithMetaData } from './iota/useCurrentAddedIotaNFTsWithMetaData';
import { useCurrentAddedSuiNFTsWithMetaData } from './sui/useCurrentAddedSuiNFTsWithMetaData';

type UseCurrentAccountAddedNFTsWithMetaDataProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddedNFTsWithMetaData({ accountId }: UseCurrentAccountAddedNFTsWithMetaDataProps = {}) {
  const { addedSuiNFTsWithMeta, isLoading: isLoadingSuiNFTs } = useCurrentAddedSuiNFTsWithMetaData({ accountId });
  const { addedIotaNFTsWithMeta, isLoading: isLoadingIotaNFTs } = useCurrentAddedIotaNFTsWithMetaData({ accountId });
  const { addedEVMNFTsWithMeta, isLoading: isLoadingEVMNFTs } = useCurrentAddedEVMNFTsWithMetaData({ accountId });
  const { addedCosmosNFTsWithMeta, isLoading: isLoadingCosmsoNFTs } = useCurrentAddedCosmosNFTsWithMetaData({ accountId });

  const currentAccountAddNFTsWithMeta = useMemo(() => {
    const addedSuiNFTs = [...addedSuiNFTsWithMeta];
    const addedEVMNFTs = [...addedEVMNFTsWithMeta];
    const addedCosmosNFTs = [...addedCosmosNFTsWithMeta];
    const addedIotaNFTs = [...addedIotaNFTsWithMeta];

    return {
      sui: addedSuiNFTs,
      evm: addedEVMNFTs,
      cosmos: addedCosmosNFTs,
      iota: addedIotaNFTs,
      flat: [...addedSuiNFTs, ...addedEVMNFTs, ...addedCosmosNFTs, ...addedIotaNFTs],
    };
  }, [addedCosmosNFTsWithMeta, addedEVMNFTsWithMeta, addedIotaNFTsWithMeta, addedSuiNFTsWithMeta]);

  const isLoading = useMemo(() => {
    return isLoadingSuiNFTs || isLoadingEVMNFTs || isLoadingCosmsoNFTs || isLoadingIotaNFTs;
  }, [isLoadingCosmsoNFTs, isLoadingEVMNFTs, isLoadingIotaNFTs, isLoadingSuiNFTs]);

  return { currentAccountAddNFTsWithMeta, isLoading };
}
