import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { isAxiosError } from '~/Popup/utils/axios';
import { getIpfsData } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';
import type { NFTMetaResponse } from '~/types/cosmos/nft';

import { useNFTsURISWR } from './useNFTsURISWR';

type NFTInfo = {
  contractAddress: string;
  tokenId: string;
};

type FetcherParams = {
  tokenURI: string;
  nftInfo: NFTInfo;
};

type MultiFetcherParams = {
  fetcherParam: FetcherParams[];
};

type UseNFTsMetaSWR = {
  chain: CosmosChain;
  nftInfos: NFTInfo[];
};

export function useNFTsMetaSWR({ chain, nftInfos }: UseNFTsMetaSWR, config?: SWRConfiguration) {
  const ownedNFTSourceURI = useNFTsURISWR({ chain, nftInfos }, config);

  const fetcherParams = useMemo(
    () =>
      ownedNFTSourceURI.data.map((item) => ({
        tokenURI: item.tokenURI,
        nftInfo: {
          contractAddress: item?.contractAddress,
          tokenId: item?.tokenId,
        },
      })),
    [ownedNFTSourceURI.data],
  );

  const fetcher = async (fetchUrl: string, nftInfo: NFTInfo) => {
    try {
      if (ownedNFTSourceURI.error) {
        throw ownedNFTSourceURI.error;
      }

      return await getIpfsData(fetchUrl, nftInfo.contractAddress, nftInfo.tokenId);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const multiFetcher = (params: MultiFetcherParams) => Promise.allSettled(params.fetcherParam.map((item) => fetcher(item.tokenURI, item.nftInfo)));

  const { data, isValidating, error, mutate } = useSWR<PromiseSettledResult<NFTMetaResponse | null>[], AxiosError>(
    { fetcherParam: fetcherParams },
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

  const returnData = useMemo(
    () =>
      data?.reduce((accumulator: NFTMetaResponse[], item) => {
        if (item.status === 'fulfilled' && item.value) {
          const newItem = {
            ...item.value,
          };
          accumulator.push(newItem);
        }
        return accumulator;
      }, []) || [],
    [data],
  );

  return { data: returnData, isValidating, error, mutate };
}
