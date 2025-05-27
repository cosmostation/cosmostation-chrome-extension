import { throttle } from 'lodash';
import type { ConfirmedSignatureInfo } from '@solana/web3.js';
import { Connection, PublicKey } from '@solana/web3.js';

import { isAxiosError } from '@/utils/axios';

import type { UseInfiniteFetchConfig } from '../common/useInfiniteFetch';
import { useInfiniteFetch } from '../common/useInfiniteFetch';
import { useGetAccountAsset } from '../useGetAccountAsset';

type UseGetSignaturesForAddressProps = {
  coinId: string;
  config?: UseInfiniteFetchConfig;
};

const limit = 25;

export function useGetSignaturesForAddress({ coinId, config }: UseGetSignaturesForAddressProps) {
  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });
  const accountAsset = getSolanaAccountAsset();

  const address = accountAsset?.address.address || '';

  const rpcURLs = accountAsset?.chain.rpcUrls.map((item) => item.url) || [];

  const fetcher = async (pageParam: string, address: string, index = 0) => {
    try {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      const connection = new Connection(rpcURLs[index], 'confirmed');

      const pubAddress = new PublicKey(address);

      const response = await connection.getSignaturesForAddress(pubAddress, {
        before: !pageParam ? undefined : pageParam,
        limit: limit,
      });

      return response;
    } catch (e) {
      if (index >= rpcURLs.length) {
        throw new Error('All endpoints failed');
      }

      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }

      return fetcher(pageParam, address, index + 1);
    }
  };

  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status, isLoading, isPending } = useInfiniteFetch<
    ConfirmedSignatureInfo[] | null
  >({
    queryKey: ['useGetSignaturesForAddress', address, coinId],
    fetchFunction: ({ pageParam }) => fetcher(pageParam, address),
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < limit) {
        return undefined;
      }
      return lastPage?.[lastPage.length - 1]?.signature || undefined;
    },
    config: {
      enabled: !!coinId && !!address && !!rpcURLs.length,
      ...config,
    },
  });

  const handleIntersect = throttle(async () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, 2000);

  return { data, error, fetchNextPage: handleIntersect, hasNextPage, isFetching, isFetchingNextPage, status, isLoading, isPending };
}
