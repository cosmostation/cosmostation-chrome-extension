import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { ContractInfoPayload, ContractsInfoPayload } from '~/types/cosmos/contract';

type MultiFetcherParams = {
  fetcherParam: string[];
};

export function useContractsInfoSWR(chain: CosmosChain, contractAddresses: string[], config?: SWRConfiguration) {
  const { getCW721ContractInfo } = useMemo(() => cosmosURL(chain), [chain]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const fetcher = async (fetchUrl: string, contractAddress: string) => {
    try {
      const returnData = await get<ContractInfoPayload>(fetchUrl);
      return {
        contractAddress,
        ...returnData.data,
      };
    } catch (e: unknown) {
      return null;
    }
  };

  const multiFetcher = (params: MultiFetcherParams) =>
    Promise.allSettled(
      params.fetcherParam.map((item) => {
        const requestURL = getCW721ContractInfo(item);

        const isValidContractAddress = regex.test(item);

        return isValidContractAddress ? fetcher(requestURL, item) : null;
      }),
    );

  const { data, error, mutate } = useSWR<PromiseSettledResult<ContractsInfoPayload | null>[], AxiosError>({ fetcherParam: contractAddresses }, multiFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !contractAddresses,
    ...config,
  });

  const returnData = useMemo(
    () =>
      data?.reduce((accumulator: ContractsInfoPayload[], item) => {
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
