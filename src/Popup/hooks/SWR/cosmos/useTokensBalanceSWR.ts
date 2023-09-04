import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { CW20BalanceResponse, CW20TokensBalanceResponse } from '~/types/cosmos/contract';

type UseTokensBalanceSWR = {
  chain: CosmosChain;
  contractAddresses: string[];
  address: string;
};

type MultiFetcherParams = {
  fetcherParamsList: string[];
};

export function useTokensBalanceSWR({ chain, contractAddresses, address }: UseTokensBalanceSWR, config?: SWRConfiguration) {
  const { getCW20Balance } = cosmosURL(chain);

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const isValidAddress = regex.test(address);

  const fetcher = async (fetchUrl: string, contractAddress: string) => {
    const response = await get<CW20BalanceResponse>(fetchUrl);
    return {
      contractAddress,
      balance: response.data.balance || '0',
    };
  };

  const multiFetcher = (params: MultiFetcherParams) =>
    Promise.allSettled(
      params.fetcherParamsList.map((item) => {
        const requestURL = getCW20Balance(item, address);
        const isValidContractAddress = regex.test(item);

        return isValidContractAddress ? fetcher(requestURL, item) : null;
      }),
    );

  const { data, error, mutate } = useSWR<PromiseSettledResult<CW20TokensBalanceResponse | null>[], AxiosError>(
    {
      fetcherParamsList: contractAddresses,
    },
    multiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !contractAddresses || !isValidAddress,
      ...config,
    },
  );

  const returnData = useMemo(
    () =>
      data?.reduce((accumulator: CW20TokensBalanceResponse[], item) => {
        if (item.status === 'fulfilled' && item.value) {
          const newItem = { ...item.value };
          accumulator.push(newItem);
        }
        return accumulator;
      }, []) || [],
    [data],
  );

  return { data: returnData, error, mutate };
}
