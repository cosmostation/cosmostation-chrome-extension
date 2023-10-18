import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_SWAP_BASE_URL } from '~/constants/1inch';
import { get } from '~/Popup/utils/axios';
import type { AllowanceTxPayload } from '~/types/1inch/allowance';

type UseAllowanceTxSWRProps = {
  tokenAddress: string;
  chainId: string;
};

export function useAllowanceTxSWR(allowanceTxParam?: UseAllowanceTxSWRProps, config?: SWRConfiguration) {
  const requestURL = `${ONEINCH_SWAP_BASE_URL}/${allowanceTxParam?.chainId || ''}/approve/transaction?tokenAddress=${allowanceTxParam?.tokenAddress || ''}`;

  const fetcher = (fetchUrl: string) => get<AllowanceTxPayload>(fetchUrl, { Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` });

  const { data, error, mutate } = useSWR<AllowanceTxPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !allowanceTxParam,
    ...config,
  });

  return { data, error, mutate };
}
