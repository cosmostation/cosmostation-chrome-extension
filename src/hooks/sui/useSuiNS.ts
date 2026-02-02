import type { SuiResolveNameServiceAddressResponse, SuiResolveNameServiceNamesResponse } from '@/types/sui/api';
import { post } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { parseCoinId } from '@/utils/queryParamGenerator';
import { isSuiNSDomain } from '@/utils/sui/nameService';

import { useFetch, type UseFetchConfig } from '../common/useFetch';
import { useChainList } from '../useChainList';

type UseSuiResolveNameServiceNamesProps = {
  coinId: string;
  targetAddress: string;
  config?: UseFetchConfig;
};

export function useSuiResolveNameServiceNames({ coinId, targetAddress, config }: UseSuiResolveNameServiceNamesProps) {
  const { chainList } = useChainList();

  const { chainId: parsedChainId, chainType: parsedChainType } = parseCoinId(coinId);
  const rpcURLs =
    chainList.suiChains?.find((chain) => chain.id === parsedChainId && chain.chainType === parsedChainType)?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    if (!targetAddress) return null;

    const fetchAllPages = async (url: string) => {
      const returnData: SuiResolveNameServiceNamesResponse[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;

      while (hasNextPage) {
        const response: SuiResolveNameServiceNamesResponse = await post<SuiResolveNameServiceNamesResponse>(url, {
          jsonrpc: '2.0',
          method: 'suix_resolveNameServiceNames',
          params: [targetAddress, cursor],
          id: targetAddress,
        });

        if (response.error || !response.result) {
          throw new Error(response.error?.message || 'Invalid response from RPC');
        }

        returnData.push(response);
        hasNextPage = !!response.result?.hasNextPage;
        cursor = response.result?.nextCursor ?? null;
      }
      return returnData;
    };

    return await fetchWithFailover(rpcURLs, fetchAllPages);
  };

  return useFetch({
    queryKey: ['useSuiResolveNameServiceNames', coinId, targetAddress],
    fetchFunction: fetcher,
    config: {
      refetchInterval: 1000 * 15,
      retry: false,
      enabled: !!coinId && !!targetAddress && rpcURLs.length > 0,
      ...config,
    },
  });
}

type UseSuiResolveNameServiceAddressProps = {
  coinId: string;
  domain: string;
  config?: UseFetchConfig;
};

export function useSuiResolveNameServiceAddress({ coinId, domain, config }: UseSuiResolveNameServiceAddressProps) {
  const { chainList } = useChainList();

  const { chainId: parsedChainId, chainType: parsedChainType } = parseCoinId(coinId);
  const rpcURLs =
    chainList.suiChains?.find((chain) => chain.id === parsedChainId && chain.chainType === parsedChainType)?.rpcUrls.map((item) => item.url) || [];

  const fetcher = async () => {
    const fetchFromUrl = async (url: string) => {
      const response = await post<SuiResolveNameServiceAddressResponse>(url, {
        jsonrpc: '2.0',
        method: 'suix_resolveNameServiceAddress',
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
    queryKey: ['useSuiResolveNameServiceAddress', coinId, domain],
    fetchFunction: fetcher,
    config: {
      enabled: !!coinId && rpcURLs.length > 0 && !!domain && isSuiNSDomain(domain),
      ...config,
    },
  });
}
