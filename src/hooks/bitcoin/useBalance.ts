import { useMemo } from 'react';

import type { AccountDetail } from '@/types/bitcoin/balance';
import { get } from '@/utils/axios';
import { buildRequestUrl } from '@/utils/fetch';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseBalanceProps = {
  coinId: string;
  config?: UseFetchConfig;
};

export function useBalance({ coinId, config }: UseBalanceProps) {
  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId });

  const bitcoinAccountAsset = getBitcoinAccountAsset();

  const requestURL = useMemo(() => {
    if (!bitcoinAccountAsset?.chain.mempoolURL || !bitcoinAccountAsset.address.address) return '';

    return buildRequestUrl(bitcoinAccountAsset.chain.mempoolURL, `/address/${bitcoinAccountAsset.address.address}`);
  }, [bitcoinAccountAsset?.address.address, bitcoinAccountAsset?.chain.mempoolURL]);

  const fetcher = () => get<AccountDetail>(requestURL);

  const { data, isLoading, error } = useFetch({
    queryKey: ['bitcoinBalance', coinId],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && !!requestURL,
      ...config,
    },
  });

  return { data, isLoading, error };
}
