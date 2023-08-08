import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { CW20TokenInfoResponse } from '~/types/cosmos/contract';

export function useTokenInfoSWR(chain: CosmosChain, contractAddress: string, config?: SWRConfiguration) {
  const { getCW20TokenInfo } = cosmosURL(chain);

  const requestURL = getCW20TokenInfo(contractAddress);

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const isValidContractAddress = regex.test(contractAddress);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<CW20TokenInfoResponse>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<CW20TokenInfoResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
    errorRetryCount: 0,
    isPaused: () => !isValidContractAddress,
    ...config,
  });

  const returnData = data?.data;

  return { data: returnData, error, mutate };
}
