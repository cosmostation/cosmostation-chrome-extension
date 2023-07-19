import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_BASE_URL } from '~/constants/1inch';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { get } from '~/Popup/utils/axios';
import type { AllowancePayload } from '~/types/1inch/allowance';

import { useCurrentChain } from '../../useCurrent/useCurrentChain';

type UseAllowanceSWRProps = {
  tokenAddress: string;
  walletAddress: string;
  chainId: string;
};

export function useAllowanceSWR(allowanceParam?: UseAllowanceSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const requestURL = `${ONEINCH_BASE_URL}/${allowanceParam?.chainId || ''}/approve/allowance?tokenAddress=${allowanceParam?.tokenAddress || ''}&walletAddress=${
    allowanceParam?.walletAddress || ''
  }`;

  const fetcher = (fetchUrl: string) => get<AllowancePayload>(fetchUrl, { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' } });

  const { data, error, mutate } = useSWR<AllowancePayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => currentChain.id !== ETHEREUM.id || !allowanceParam,
    ...config,
  });

  return { data, error, mutate };
}
