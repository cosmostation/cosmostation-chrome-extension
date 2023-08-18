import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { NFTInfoPayload } from '~/types/cosmos/contract';

type UseNFTURISWRProps = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export function useNFTURISWR({ chain, contractAddress, tokenId }: UseNFTURISWRProps, config?: SWRConfiguration) {
  const { getCW721NFTInfo } = useMemo(() => cosmosURL(chain), [chain]);

  const requestURL = useMemo(() => getCW721NFTInfo(contractAddress, tokenId), [contractAddress, getCW721NFTInfo, tokenId]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const isValidContractAddress = useMemo(() => regex.test(contractAddress), [contractAddress, regex]);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<NFTInfoPayload>(fetchUrl);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<NFTInfoPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    isPaused: () => !isValidContractAddress,
    ...config,
  });

  const returnData = useMemo(() => data?.data, [data?.data]);

  return { data: returnData, isValidating, error, mutate };
}
