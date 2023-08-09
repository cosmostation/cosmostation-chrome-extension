import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { NFTIDPayload } from '~/types/cosmos/contract';

type UseOwnedNFTTokenIDsSWR = {
  chain: CosmosChain;
  contractAddress: string;
  ownerAddress: string;
  limit?: string;
};

export function useOwnedNFTTokenIDsSWR({ chain, contractAddress, ownerAddress, limit = '50' }: UseOwnedNFTTokenIDsSWR, config?: SWRConfiguration) {
  const { getCW721NFTIds } = useMemo(() => cosmosURL(chain), [chain]);

  const requestURL = useMemo(() => getCW721NFTIds(contractAddress, ownerAddress, Number(limit)), [contractAddress, getCW721NFTIds, limit, ownerAddress]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const isValidContractAddress = useMemo(() => regex.test(contractAddress), [contractAddress, regex]);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<NFTIDPayload>(fetchUrl);
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<NFTIDPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
    refreshInterval: 11000,
    errorRetryCount: 0,
    isPaused: () => !isValidContractAddress,
    ...config,
  });

  const returnData = useMemo(() => data?.data, [data?.data]);

  return { data: returnData, isValidating, error, mutate };
}
