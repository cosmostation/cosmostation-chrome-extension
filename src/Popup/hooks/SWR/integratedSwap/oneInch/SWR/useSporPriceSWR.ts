import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_SPOT_PRICE_BASE_URL } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import { hexToDecimal } from '~/Popup/utils/string';
import type { SpotPrice, SpotPricesResponse } from '~/types/1inch/swap';
import type { CurrencyType } from '~/types/extensionStorage';

type UseSpotPriceSWRProps = {
  chainId: string;
  currency: CurrencyType;
};

export function useSpotPriceSWR(useSpotPriceSWRProps?: UseSpotPriceSWRProps, config?: SWRConfiguration) {
  const parsedChainId = useMemo(() => hexToDecimal(useSpotPriceSWRProps?.chainId), [useSpotPriceSWRProps?.chainId]);

  const requestURL = useMemo(
    () => `${ONEINCH_SPOT_PRICE_BASE_URL}/${parsedChainId || ''}?currency=${useSpotPriceSWRProps?.currency || ''}`,
    [parsedChainId, useSpotPriceSWRProps?.currency],
  );

  const fetcher = (fetchUrl: string) => get<SpotPrice>(fetchUrl, { headers: { Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` } });

  const { data, error, mutate } = useSWR<SpotPrice, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    isPaused: () => !useSpotPriceSWRProps,
    ...config,
  });

  const convertedReturnData = useMemo<SpotPricesResponse | undefined>(
    () => data && Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Number(value)])),
    [data],
  );

  return { data: convertedReturnData, error, mutate };
}
