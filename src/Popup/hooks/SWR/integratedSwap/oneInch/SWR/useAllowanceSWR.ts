import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_SWAP_BASE_URL } from '~/constants/1inch';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { get } from '~/Popup/utils/axios';
import { hexToDecimal } from '~/Popup/utils/string';
import type { AllowancePayload } from '~/types/1inch/allowance';

type UseAllowanceSWRProps = {
  tokenAddress: string;
  walletAddress: string;
  chainId: string;
};

export function useAllowanceSWR(allowanceParam?: UseAllowanceSWRProps, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();

  const parsedChainId = useMemo(() => hexToDecimal(allowanceParam?.chainId), [allowanceParam?.chainId]);

  const requestURL = useMemo(
    () =>
      `${ONEINCH_SWAP_BASE_URL}/${parsedChainId || ''}/approve/allowance?tokenAddress=${allowanceParam?.tokenAddress || ''}&walletAddress=${
        allowanceParam?.walletAddress || ''
      }`,
    [allowanceParam?.tokenAddress, allowanceParam?.walletAddress, parsedChainId],
  );

  const fetcher = (fetchUrl: string) =>
    get<AllowancePayload>(fetchUrl, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0', Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` },
    });

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
