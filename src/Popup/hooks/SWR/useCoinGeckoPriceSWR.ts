import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import type { CoinGeckoPriceResponse } from '~/types/coinGecko';

import { useExtensionStorage } from '../useExtensionStorage';

export function useCoinGeckoPriceSWR(config?: SWRConfiguration) {
  const { extensionStorage } = useExtensionStorage();

  const requestURL = `https://front.api.mintscan.io/v10/utils/market/prices?currency=${extensionStorage.currency}`;

  const fetcher = (fetchUrl: string) => get<CoinGeckoPriceResponse>(fetchUrl);

  const { data, error, mutate } = useSWR<CoinGeckoPriceResponse, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    ...config,
  });

  return { data, error, mutate };
}
