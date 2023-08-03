import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { GetOwnedNFTTokenIdsPayload, SmartPayload } from '~/types/cosmos/contract';
import type { OwnedTokenIds } from '~/types/cosmos/nft';

import { useAccounts } from '../../cache/useAccounts';

type MultiFetcherParams = {
  fetcherParam: string[];
  ownerAddress: string;
};

type UseGetOwnedNFTTokenIDsSWRSWR = {
  chain: CosmosChain;
  contractAddresses: string[];
  ownerAddress: string;
  limit?: string;
};

export function useGetOwnedNFTTokenIDsSWR({ chain, contractAddresses, ownerAddress, limit = '50' }: UseGetOwnedNFTTokenIDsSWRSWR, config?: SWRConfiguration) {
  const accounts = useAccounts(config?.suspense);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const ownerWalletAddress = ownerAddress || currentAddress;

  const { getCW721NFTIds } = cosmosURL(chain);

  const regex = getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]);

  const fetcher = async (fetchUrl: string, contractAddress: string) => {
    try {
      const retrunData = await get<SmartPayload>(fetchUrl);
      return {
        contractAddress,
        data: retrunData,
      };
    } catch (e: unknown) {
      return null;
    }
  };

  const multiFetcher = (params: MultiFetcherParams) =>
    Promise.allSettled(
      params.fetcherParam.map((item) => {
        const requestURL = getCW721NFTIds(item, params.ownerAddress, Number(limit));

        const isValidContractAddress = regex.test(item);

        return isValidContractAddress ? fetcher(requestURL, item) : null;
      }),
    );

  const { data, error, mutate } = useSWR<PromiseSettledResult<GetOwnedNFTTokenIdsPayload | null>[], AxiosError>(
    { fetcherParam: contractAddresses, ownerAddress: ownerWalletAddress },
    multiFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      isPaused: () => !contractAddresses || !ownerWalletAddress,
      ...config,
    },
  );

  // NOTE 이거 참조해서 다른코드도 undefined제거
  const returnData =
    (data
      ?.map((item) => {
        if (item.status === 'fulfilled') {
          if (item.value?.data.result.smart) {
            return {
              ...JSON.parse(Buffer.from(item.value.data.result.smart, 'base64').toString('utf-8')),
              contractAddress: item.value.contractAddress,
            } as OwnedTokenIds;
          }
        }
        return undefined;
      })
      .filter((item) => !!item) as OwnedTokenIds[]) || [];

  return { data: returnData, error, mutate };
}
