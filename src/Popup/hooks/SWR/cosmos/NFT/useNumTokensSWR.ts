import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { NumTokensInfoPayload } from '~/types/cosmos/contract';

export function useNumTokensSWR(chain: CosmosChain, contractAddress: string, config?: SWRConfiguration) {
  const { getCW721NumTokens } = useMemo(() => cosmosURL(chain), [chain]);

  const requestURL = useMemo(() => getCW721NumTokens(contractAddress), [contractAddress, getCW721NumTokens]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const isValidContractAddress = useMemo(() => regex.test(contractAddress), [contractAddress, regex]);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<NumTokensInfoPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<NumTokensInfoPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !isValidContractAddress,
    ...config,
  });

  const returnData = useMemo(() => data?.data, [data?.data]);

  return { data: returnData, error, mutate };
}
