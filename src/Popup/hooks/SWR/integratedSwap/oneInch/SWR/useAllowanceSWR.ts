import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_SWAP_BASE_URL } from '~/constants/1inch';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { get } from '~/Popup/utils/axios';
import type { AllowancePayload } from '~/types/1inch/allowance';

type UseAllowanceSWRProps = {
  tokenAddress: string;
  walletAddress: string;
  chainId: string;
};

export function useAllowanceSWR(allowanceParam?: UseAllowanceSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const requestURL = `${ONEINCH_SWAP_BASE_URL}/${allowanceParam?.chainId || ''}/approve/allowance?tokenAddress=${
    allowanceParam?.tokenAddress || ''
  }&walletAddress=${allowanceParam?.walletAddress || ''}`;

  const fetcher = (fetchUrl: string) =>
    get<AllowancePayload>(
      fetchUrl,
      { Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` },
      {
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
      },
    );

  const { data, error, mutate } = useSWR<AllowancePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 11000,
    refreshInterval: 12000,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    isPaused: () => currentChain.id !== ETHEREUM.id || !allowanceParam,
    ...config,
  });

  return { data, error, mutate };
}
