import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { NFTCollectionInfoPayload, SmartPayload } from '~/types/cosmos/contract';
import type { CollectionInfo } from '~/types/cosmos/nft';

type MultiFetcherParams = {
  fetcherParam: string[];
};

type UseNFTCollectionsInfoSWRParams = {
  chain: CosmosChain;
  contractAddresses: string[];
};

export function useNFTCollectionsInfoSWR({ chain, contractAddresses }: UseNFTCollectionsInfoSWRParams, config?: SWRConfiguration) {
  const { getCW721CollectionInfo } = useMemo(() => cosmosURL(chain), [chain]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

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
        const requestURL = getCW721CollectionInfo(item);

        const isValidContractAddress = regex.test(item);

        return isValidContractAddress ? fetcher(requestURL, item) : null;
      }),
    );

  const { data, error, mutate } = useSWR<PromiseSettledResult<NFTCollectionInfoPayload | null>[], AxiosError>(
    { id: 'nftCollection', fetcherParam: contractAddresses },
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

  const returnData = useMemo(
    () =>
      data?.reduce((accumulator: CollectionInfo[], item) => {
        if (item.status === 'fulfilled' && item.value) {
          const newItem = {
            ...JSON.parse(Buffer.from(item.value?.data.result.smart, 'base64').toString('utf-8')),
            contractAddress: item.value.contractAddress,
          } as CollectionInfo;
          accumulator.push(newItem);
        }
        return accumulator;
      }, []) || [],
    [data],
  );

  return { data: returnData, error, mutate };
}
