import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { NFTIdPayload, SmartPayload } from '~/types/cosmos/contract';

type UseGetNFTTokenIdsSWR = {
  chain: CosmosChain;
  contractAddress: string;
  ownerAddress: string;
  limit?: string;
};

export function useGetNFTTokenIdsSWR({ chain, contractAddress, ownerAddress, limit = '50' }: UseGetNFTTokenIdsSWR, config?: SWRConfiguration) {
  const { getCW721NFTIds } = cosmosURL(chain);

  const requestURL = getCW721NFTIds(contractAddress, ownerAddress, Number(limit));

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const isValidContractAddress = regex.test(contractAddress);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<SmartPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<SmartPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
    errorRetryCount: 0,
    isPaused: () => !isValidContractAddress,
    ...config,
  });

  const returnData = data?.result?.smart ? (JSON.parse(Buffer.from(data?.result?.smart, 'base64').toString('utf-8')) as NFTIdPayload) : undefined;

  return { data: returnData, error, mutate };
}
