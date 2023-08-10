import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import type { Allowance } from '@0xsquid/sdk';

import { EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { SQUID_MAX_APPROVE_AMOUNT } from '~/constants/squid';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';

import { useSquidSWR } from './useSquidSWR';

type RouteError = {
  errors?: {
    error: string;
    message: string;
    errorType: string;
  }[];
};

export function useAllowanceSWR(allowanceParam?: Allowance, config?: SWRConfiguration) {
  const squid = useSquidSWR({ suspense: true });

  const fetcher = async (param: Allowance) => {
    try {
      if (isEqualsIgnoringCase(param.tokenAddress, EVM_NATIVE_TOKEN_ADDRESS)) {
        return SQUID_MAX_APPROVE_AMOUNT;
      }
      const allowance = await squid.data?.allowance(param);

      // eslint-disable-next-line no-underscore-dangle
      return allowance?._hex ? BigInt(allowance._hex).toString(10) : null;
    } catch (error) {
      return null;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<string | null, RouteError>(allowanceParam, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 11000,
    refreshInterval: 12000,
    errorRetryCount: 0,
    isPaused: () => !allowanceParam,
    ...config,
  });

  return { data, isValidating, error, mutate };
}
