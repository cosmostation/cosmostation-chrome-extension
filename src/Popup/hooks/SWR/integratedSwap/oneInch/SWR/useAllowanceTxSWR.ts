import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_SWAP_BASE_URL } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import { hexToDecimal } from '~/Popup/utils/string';
import type { AllowanceTxPayload } from '~/types/1inch/allowance';

type UseAllowanceTxSWRProps = {
  tokenAddress: string;
  chainId: string;
};

export function useAllowanceTxSWR(allowanceTxParam?: UseAllowanceTxSWRProps, config?: SWRConfiguration) {
  const parsedChainId = useMemo(() => hexToDecimal(allowanceTxParam?.chainId), [allowanceTxParam?.chainId]);

  const requestURL = useMemo(
    () => `${ONEINCH_SWAP_BASE_URL}/${parsedChainId || ''}/approve/transaction?tokenAddress=${allowanceTxParam?.tokenAddress || ''}`,
    [allowanceTxParam?.tokenAddress, parsedChainId],
  );

  const fetcher = (fetchUrl: string) => get<AllowanceTxPayload>(fetchUrl, { headers: { Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` } });

  const { data, error, mutate } = useSWR<AllowanceTxPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    isPaused: () => !allowanceTxParam,
    ...config,
  });

  return { data, error, mutate };
}
