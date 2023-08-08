import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { CW20BalanceResponse } from '~/types/cosmos/contract';

export function useTokenBalanceSWR(chain: CosmosChain, contractAddress: string, address: string, config?: SWRConfiguration) {
  const { getCW20Balance } = cosmosURL(chain);

  const requestURL = getCW20Balance(contractAddress, address);

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const isValidContractAddress = regex.test(contractAddress);
  const isValidAddress = regex.test(address);

  const fetcher = (fetchUrl: string) => get<CW20BalanceResponse>(fetchUrl);

  const { data, error, mutate } = useSWR<CW20BalanceResponse, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => !isValidContractAddress || !isValidAddress,
    ...config,
  });

  const returnData = data?.data;

  return { data: returnData, error, mutate };
}
