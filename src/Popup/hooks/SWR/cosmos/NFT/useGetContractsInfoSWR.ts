import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { GetNFTContractInfoPayload, SmartPayload } from '~/types/cosmos/contract';
import type { ContractInfo } from '~/types/cosmos/nft';

type MultiFetcherParams = {
  fetcherParam: string[];
};

export function useGetContractsInfoSWR(chain: CosmosChain, contractAddresses: string[], config?: SWRConfiguration) {
  const { getCW721ContractInfo } = cosmosURL(chain);

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const fetcher = async (fetchUrl: string, contractAddress: string) => {
    try {
      const returnData = await get<SmartPayload>(fetchUrl);
      return {
        contractAddress,
        data: returnData,
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

  const { data, error, mutate } = useSWR<PromiseSettledResult<GetNFTContractInfoPayload | null>[], AxiosError>(
    { fetcherParam: contractAddresses },
    multiFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      isPaused: () => !contractAddresses,
      ...config,
    },
  );

  const returnData = data?.map((item) => {
    if (item.status === 'fulfilled') {
      return item.value?.data.result.smart
        ? ({
            ...JSON.parse(Buffer.from(item.value?.data.result.smart, 'base64').toString('utf-8')),
            contractAddress: item.value.contractAddress,
          } as ContractInfo)
        : undefined;
    }
    return undefined;
  });

  return { data: returnData, error, mutate };
}
