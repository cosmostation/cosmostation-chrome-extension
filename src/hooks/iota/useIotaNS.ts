import type { IotaNameLookupResponse, IotaNameReverseLookupResponse } from '@/types/iota/api';
import { post } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { isIotaNSDomain } from '@/utils/iota/nameService';
import { parseCoinId } from '@/utils/queryParamGenerator';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useChainList } from '../useChainList';

type UseIotaNamesLookupProps = {
  coinId: string;
  domain: string;
  config?: UseFetchConfig;
};

export function useIotaNamesLookup({ coinId, domain, config }: UseIotaNamesLookupProps) {
  const { chainList } = useChainList();

  const { chainId: parsedChainId, chainType: parsedChainType } = parseCoinId(coinId);
  const rpcURLs =
    chainList.iotaChains?.find((chain) => chain.id === parsedChainId && chain.chainType === parsedChainType)?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    const fetchFromUrl = async (url: string) => {
      const response = await post<IotaNameLookupResponse>(url, {
        jsonrpc: '2.0',
        method: 'iotax_iotaNamesLookup',
        params: [domain],
        id: domain,
      });

      if (response.error) {
        throw new Error(response.error.message || 'RPC error');
      }

      return response;
    };

    return await fetchWithFailover(rpcURLs, fetchFromUrl);
  };

  return useFetch({
    queryKey: ['useIotaNamesLookup', coinId, domain],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && rpcURLs.length > 0 && !!domain && isIotaNSDomain(domain),
      ...config,
    },
  });
}

type UseIotaNamesReverseLookupProps = {
  coinId: string;
  targetAddress: string;
  config?: UseFetchConfig;
};

export function useIotaNamesReverseLookup({ coinId, targetAddress, config }: UseIotaNamesReverseLookupProps) {
  const { chainList } = useChainList();

  const { chainId: parsedChainId, chainType: parsedChainType } = parseCoinId(coinId);
  const rpcURLs =
    chainList.iotaChains?.find((chain) => chain.id === parsedChainId && chain.chainType === parsedChainType)?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    const fetchFromUrl = async (url: string) => {
      const response = await post<IotaNameReverseLookupResponse>(url, {
        jsonrpc: '2.0',
        method: 'iotax_iotaNamesReverseLookup',
        params: [targetAddress],
        id: targetAddress,
      });

      if (response.error) {
        throw new Error(response.error.message || 'RPC error');
      }

      return response;
    };

    return await fetchWithFailover(rpcURLs, fetchFromUrl);
  };

  return useFetch({
    queryKey: ['useIotaNamesReverseLookup', coinId, targetAddress],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && rpcURLs.length > 0 && !!targetAddress,
      ...config,
    },
  });
}
