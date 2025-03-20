import { useMemo } from 'react';

import { useCurrentAddedSuiNFTsWithMetaData } from './sui/useCurrentAddedSuiNFTsWithMetaData';

type UseCurrentAccountAddibleNFTsProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddibleNFTs({ accountId }: UseCurrentAccountAddibleNFTsProps = {}) {
  const { allSuiNFTsWithMeta, isLoading: isSuiLoading } = useCurrentAddedSuiNFTsWithMetaData({ accountId });
  // NOTE const { mappedSuiNFTs2 } = useCurrentAddedCosmosNFTsWithMetaData({ accountId });

  const currentAccountAddibleNFTs = useMemo(() => {
    return {
      sui: allSuiNFTsWithMeta,
    };
  }, [allSuiNFTsWithMeta]);

  const isLoading = useMemo(() => {
    return isSuiLoading;
  }, [isSuiLoading]);

  return { currentAccountAddibleNFTs, isLoading };
}
