import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { Asset } from '~/types/aptos/assets';

import { useCurrentAptosNetwork } from '../../useCurrent/useCurrentAptosNetwork';

export function useAssetsSWR(config?: SWRConfiguration) {
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const requestURL = 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/aptos/contract.json';

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<Asset[]>(fetchUrl);
    } catch (e: unknown) {
      return [];
    }
  };

  const { data, error, mutate } = useSWR<Asset[], AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const returnData = useMemo(
    () =>
      (data?.filter((item) => item.chainId === currentAptosNetwork.chainId) || []).map((item) => ({
        ...item,
        image: item.image ? `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${item.image}` : undefined,
      })),
    [currentAptosNetwork.chainId, data],
  );

  return { data: returnData, error, mutate, isLoading: data === undefined };
}
