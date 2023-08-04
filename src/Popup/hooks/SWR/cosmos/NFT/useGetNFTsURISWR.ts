import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { GetNFTsURIPayload, SmartPayload } from '~/types/cosmos/contract';
import type { NFTURIInfo } from '~/types/cosmos/nft';

type NFTInfo = {
  contractAddress: string;
  tokenId: string;
};

type MultiFetcherParams = {
  fetcherParam: NFTInfo[];
};

type UseGetNFTsURISWRProps = {
  chain: CosmosChain;
  nftInfos: NFTInfo[];
};

export function useGetNFTsURISWR({ chain, nftInfos }: UseGetNFTsURISWRProps, config?: SWRConfiguration) {
  const { getCW721NFTInfo } = useMemo(() => cosmosURL(chain), [chain]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const fetcher = async (fetchUrl: string, contractAddress: string, tokenId: string) => {
    try {
      const returnData = await get<SmartPayload>(fetchUrl);
      return {
        contractAddress,
        tokenId,
        data: returnData,
      };
    } catch (e: unknown) {
      return null;
    }
  };

  const multiFetcher = (params: MultiFetcherParams) =>
    Promise.allSettled(
      params.fetcherParam.map((item) => {
        const requestURL = getCW721NFTInfo(item.contractAddress, item.tokenId);

        const isValidContractAddress = regex.test(item.contractAddress);

        return isValidContractAddress ? fetcher(requestURL, item.contractAddress, item.tokenId) : null;
      }),
    );

  const { data, error, mutate } = useSWR<PromiseSettledResult<GetNFTsURIPayload | null>[], AxiosError>({ fetcherParam: nftInfos }, multiFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    isPaused: () => !nftInfos,
    ...config,
  });

  const returnData = useMemo(
    () =>
      data
        ? data.reduce((accumulator: NFTURIInfo[], item) => {
            if (item.status === 'fulfilled' && item.value) {
              const newItem = {
                ...JSON.parse(Buffer.from(item.value?.data.result.smart, 'base64').toString('utf-8')),
                contractAddress: item.value.contractAddress,
                tokenId: item.value.tokenId,
              } as NFTURIInfo;
              accumulator.push(newItem);
            }
            return accumulator;
          }, [])
        : [],
    [data],
  );

  return { data: returnData, error, mutate };
}
