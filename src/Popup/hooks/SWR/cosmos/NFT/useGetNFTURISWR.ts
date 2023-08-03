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
  const { getCW721NFTInfo } = cosmosURL(chain);

  const requestURL = getCW721NFTInfo(contractAddress, tokenId);

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const isValidContractAddress = regex.test(contractAddress);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<SmartPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, isValidating, error, mutate } = useSWR<SmartPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
    errorRetryCount: 0,
    isPaused: () => !isValidContractAddress,
    ...config,
  });

  const returnData = data?.result?.smart ? (JSON.parse(Buffer.from(data?.result?.smart, 'base64').toString('utf-8')) as NFTInfoPayload) : undefined;

  return { data: returnData, isValidating, error, mutate };
}
