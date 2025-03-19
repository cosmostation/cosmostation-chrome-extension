import { useMemo } from 'react';

import { useCurrentAddedSuiNFTsWithMetaData } from './sui/useCurrentAddedSuiNFTsWithMetaData';

type UseCurrentAccountAddibleNFTsProps =
  | {
      accountId?: string;
    }
  | undefined;

export function useCurrentAccountAddibleNFTs({ accountId }: UseCurrentAccountAddibleNFTsProps = {}) {
  const { allSuiNFTsWithMeta } = useCurrentAddedSuiNFTsWithMetaData({ accountId });
  // NOTE const { mappedSuiNFTs2 } = useCurrentAddedCosmosNFTsWithMetaData({ accountId });

  const currentAccountAddibleNFTs = useMemo(() => {
    return {
      sui: allSuiNFTsWithMeta,
    };
  }, [allSuiNFTsWithMeta]);

  return { currentAccountAddibleNFTs };
}
