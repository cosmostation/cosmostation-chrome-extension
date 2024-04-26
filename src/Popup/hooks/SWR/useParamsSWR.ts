import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { COSMOS_CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { MINTSCAN_FRONT_API_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import { convertEVMToAssetName } from '~/Popup/utils/ethereum';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain, EthereumNetwork } from '~/types/chain';
import type { ChainParams, ParamsResponse } from '~/types/cosmos/params';

type FetchParams = {
  fetchUrl: string;
  mappingName: string;
};

export function useParamsSWR(chain: CosmosChain | EthereumNetwork, config?: SWRConfiguration) {
  const requestURL = `${MINTSCAN_FRONT_API_URL}/utils/params`;

  const mappingName = useMemo(() => {
    const foundCosmosChain = COSMOS_CHAINS.find((item) => isEqualsIgnoringCase(item.id, chain.id));
    if (foundCosmosChain) {
      return convertCosmosToAssetName(foundCosmosChain);
    }

    const foundEVMNetwork = ETHEREUM_NETWORKS.find((item) => isEqualsIgnoringCase(item.id, chain.id));
    if (foundEVMNetwork) {
      return convertEVMToAssetName(foundEVMNetwork);
    }

    return '';
  }, [chain]);

  const fetcher = async (params: FetchParams) => {
    try {
      const data = await get<ParamsResponse>(params.fetchUrl);

      return data?.[params.mappingName];
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ChainParams | null, AxiosError>({ fetchUrl: requestURL, mappingName }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 0,
    errorRetryCount: 0,
    isPaused: () => !chain,
    ...config,
  });

  return { data, error, mutate };
}
