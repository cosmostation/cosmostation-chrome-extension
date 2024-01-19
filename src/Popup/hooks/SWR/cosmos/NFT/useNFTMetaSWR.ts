import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ARCHWAY } from '~/constants/chain/cosmos/archway';
import { isAxiosError } from '~/Popup/utils/axios';
import { getIpfsData, getNFTExtensionData } from '~/Popup/utils/nft';
import type { CosmosChain } from '~/types/chain';
import type { NFTExtensionPayload } from '~/types/cosmos/contract';
import type { NFTMetaResponse } from '~/types/cosmos/nft';

import { useNFTURISWR } from './useNFTURISWR';

type FetcherParams = {
  fetchUrl: string;
  contractAddress: string;
  tokenId: string;
  extensionData?: NFTExtensionPayload;
};

type UseNFTMetaSWR = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export function useNFTMetaSWR({ chain, contractAddress, tokenId }: UseNFTMetaSWR, config?: SWRConfiguration) {
  const nftSourceURI = useNFTURISWR({ chain, contractAddress, tokenId }, config);

  const fetchUrl = useMemo(() => nftSourceURI.data?.token_uri || '', [nftSourceURI.data]);

  const fetcher = async (fetchParam: FetcherParams) => {
    try {
      if (nftSourceURI.error) {
        throw nftSourceURI.error;
      }

      if (chain.id === ARCHWAY.id && !fetchParam.fetchUrl) {
        return getNFTExtensionData(fetchParam.extensionData, fetchParam.contractAddress, fetchParam.tokenId);
      }

      return await getIpfsData(fetchParam.fetchUrl, fetchParam.contractAddress, fetchParam.tokenId);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<NFTMetaResponse | null, AxiosError>(
    {
      fetchUrl,
      contractAddress,
      tokenId,
      extensionData: nftSourceURI.data?.extension,
    },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      isPaused: () => !contractAddress || !tokenId,
      ...config,
    },
  );

  return { data, isValidating, error, mutate };
}
