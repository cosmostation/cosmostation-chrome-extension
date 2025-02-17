import { useMemo } from 'react';

import type { Utxo } from '@/types/bitcoin/balance';
import { get } from '@/utils/axios';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseUtxoProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useUtxo({ coinId, config }: UseUtxoProps) {
  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId });

  const asset = getBitcoinAccountAsset();

  const requestURL = useMemo(() => {
    if (!asset?.chain.mempoolURL || !asset.address.address) return '';

    return `${asset.chain.mempoolURL}/address/${asset.address.address}/utxo`;
  }, [asset?.chain.mempoolURL, asset?.address.address]);

  const fetcher = async () => {
    const response = await get<Utxo[]>(requestURL);

    return response;
  };

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['useUtxo', coinId, requestURL],
    fetchFunction: () => fetcher(),
    config: {
      staleTime: 1000 * 59,
      refetchInterval: 1000 * 60,
      enabled: !!coinId && !!requestURL,
      ...config,
    },
  });

  return { data, error, refetch, isLoading };
}
