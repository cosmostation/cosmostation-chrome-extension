import { useMemo } from 'react';
import { Connection, type Transaction, type VersionedTransaction } from '@solana/web3.js';

import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { analyzeTokenChanges } from '@/utils/solana/parseTx';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useChainList } from '../useChainList';

type UseAnalyzeTokenChangesProps = {
  transaction: VersionedTransaction | Transaction;
  userAddress: string;
  config?: UseFetchConfig;
};

const SOLANA_CHAIN_ID = 'solana';
const SOLANA_MAIN_ASSET_ID = 'sol';

export function useAnalyzeTokenChanges({ transaction, userAddress, config }: UseAnalyzeTokenChangesProps) {
  const { chainList } = useChainList();
  const solanaChain = chainList.solanaChains?.find((item) => item.id === SOLANA_CHAIN_ID);

  const requestURLs = useMemo(() => {
    if (!solanaChain?.rpcUrls) return [];

    return solanaChain?.rpcUrls.map(({ url }) => url).filter(Boolean);
  }, [solanaChain?.rpcUrls]);

  const fetcher = async () => {
    return await fetchWithFailover(requestURLs, async (url) => {
      const connection = new Connection(url, 'confirmed');

      const result = await analyzeTokenChanges(connection, transaction, userAddress);

      const filterOnlySol = result.filter((item) => item.mint === SOLANA_MAIN_ASSET_ID);

      return filterOnlySol;
    });
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['useAnalyzeTokenChanges', transaction.serialize(), userAddress],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!userAddress && !!transaction && !!requestURLs.length,
      staleTime: Infinity,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
