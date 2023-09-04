import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { get } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import { getCosmosAddressRegex } from '~/Popup/utils/regex';
import type { CosmosChain } from '~/types/chain';
import type { NFTIDPayload, OwnedNFTTokenIDsPayload } from '~/types/cosmos/contract';

import { useAccounts } from '../../cache/useAccounts';

type MultiFetcherParams = {
  fetcherParam: string[];
  ownerAddress: string;
};

type UseOwnedNFTsTokenIDsSWR = {
  chain: CosmosChain;
  contractAddresses: string[];
  ownerAddress: string;
  limit?: string;
};

export function useOwnedNFTsTokenIDsSWR({ chain, contractAddresses, ownerAddress, limit = '50' }: UseOwnedNFTsTokenIDsSWR, config?: SWRConfiguration) {
  const accounts = useAccounts(config?.suspense);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const ownerWalletAddress = useMemo(() => ownerAddress || currentAddress, [currentAddress, ownerAddress]);

  const { getCW721NFTIds } = useMemo(() => cosmosURL(chain), [chain]);

  const regex = useMemo(() => getCosmosAddressRegex(chain.bech32Prefix.address, [39, 59]), [chain.bech32Prefix.address]);

  const fetcher = async (fetchUrl: string, contractAddress: string) => {
    try {
      const returnData = await get<NFTIDPayload>(fetchUrl);

      return {
        contractAddress,
        tokens: returnData.data.tokens || [],
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

  const { data, error, mutate } = useSWR<PromiseSettledResult<OwnedNFTTokenIDsPayload | null>[], AxiosError>(
    { fetcherParam: contractAddresses, ownerAddress: ownerWalletAddress },
    multiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      refreshInterval: 11000,
      errorRetryCount: 0,
      isPaused: () => !contractAddresses || !ownerWalletAddress,
      ...config,
    },
  );

  const returnData = useMemo(
    () =>
      data?.reduce((accumulator: OwnedNFTTokenIDsPayload[], item) => {
        if (item.status === 'fulfilled' && item.value) {
          const newItem = { ...item.value };
          accumulator.push(newItem);
        }
        return accumulator;
      }, []) || [],
    [data],
  );

  return { data: returnData, error, mutate };
}
