import { useMemo } from 'react';

import { useCurrentAddedSuiNFTsWithMetaData } from './sui/useCurrentAddedSuiNFTsWithMetaData';

type UseCurrentAccountAddedNFTsWithMetaDataProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddedNFTsWithMetaData({ accountId }: UseCurrentAccountAddedNFTsWithMetaDataProps = {}) {
  const { addedSuiNFTsWithMeta, isLoading: isLoadingSuiNFTs } = useCurrentAddedSuiNFTsWithMetaData({ accountId });

  const currentAccountAddNFTsWithMeta = useMemo(() => {
    const addedSuiNFTs = [...addedSuiNFTsWithMeta];

    return {
      sui: addedSuiNFTs,
      flat: [...addedSuiNFTs],
    };
  }, [addedSuiNFTsWithMeta]);

  const isLoading = useMemo(() => {
    return isLoadingSuiNFTs;
  }, [isLoadingSuiNFTs]);

  return { currentAccountAddNFTsWithMeta, isLoading };
}
