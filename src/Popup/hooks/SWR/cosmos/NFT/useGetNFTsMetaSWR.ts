import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { convertIpfs } from '~/Popup/utils/nft';
import { httpsRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { GetNFTMetaPayload } from '~/types/cosmos/nft';

import { useGetNFTsURISWR } from './useGetNFTsURISWR';

type NFTInfo = {
  contractAddress: string;
  tokenId: string;
};

type MultiFetcherParams = {
  fetcherParam: string[];
};

type UseGetNFTsMetaSWR = {
  chain: CosmosChain;
  nftInfos: NFTInfo[];
};

export function useGetNFTsMetaSWR({ chain, nftInfos }: UseGetNFTsMetaSWR, config?: SWRConfiguration) {
  const ownedNFTSourceURI = useGetNFTsURISWR({ chain, nftInfos }, config);

  const paramURLs = useMemo(() => ownedNFTSourceURI.data?.map((item) => item?.token_uri).filter((item) => item !== undefined), [ownedNFTSourceURI.data]);

  const fetcher = async (fetchUrl: string) => {
    try {
      if (!httpsRegex.test(fetchUrl)) {
        return null;
      }

      // if (nftSourceURI.error) {
      //   throw nftSourceURI.error;
      // }

      return await get<GetNFTMetaPayload>(fetchUrl);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const multiFetcher = (params: MultiFetcherParams) =>
    Promise.allSettled(
      params.fetcherParam.map((item) => {
        const converted = item.includes('ipfs:') ? convertIpfs(item) : item;

        return converted ? fetcher(converted) : null;
      }),
    );

  const { data, isValidating, error, mutate } = useSWR<PromiseSettledResult<GetNFTMetaPayload | null>[], AxiosError>(
    { fetcherParam: paramURLs },
    multiFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      isPaused: () => !chain || !nftInfos,
      ...config,
    },
  );

  const returnData = data
    ? data.map((item) => {
        if (item.status === 'fulfilled') {
          return item.value
            ? {
                ...item.value,
                imageURL: convertIpfs(item.value.image),
                image: undefined,
                attributes: item.value.attributes?.filter((attribute) => attribute.trait_type && attribute.value),
                rarity: '',
              }
            : undefined;
        }
        return undefined;
      })
    : [];

  return { data: returnData, isValidating, error, mutate };
}
