import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { NFTInfoPayload, SmartPayload } from '~/types/cosmos/contract';

type UseGetNFTURISWRProps = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
};

export function useGetNFTURISWR({ chain, contractAddress, tokenId }: UseGetNFTURISWRProps, config?: SWRConfiguration) {
  const { getCW721NFTInfo } = useMemo(() => cosmosURL(chain), [chain]);

  const requestURL = useMemo(() => getCW721NFTInfo(contractAddress, tokenId), [contractAddress, getCW721NFTInfo, tokenId]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const isValidContractAddress = useMemo(() => regex.test(contractAddress), [contractAddress, regex]);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<SmartPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<SmartPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    isPaused: () => !isValidContractAddress,
    ...config,
  });

  const returnData = useMemo(
    () => (data?.result?.smart ? (JSON.parse(Buffer.from(data?.result?.smart, 'base64').toString('utf-8')) as NFTInfoPayload) : undefined),
    [data?.result?.smart],
  );

  return { data: returnData, isValidating, error, mutate };
}
