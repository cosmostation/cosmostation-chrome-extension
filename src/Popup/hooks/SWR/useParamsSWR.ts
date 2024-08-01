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

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<ParamsResponse>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ParamsResponse | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    errorRetryCount: 0,
    isPaused: () => !chain,
    ...config,
  });

  const returnData = useMemo<ChainParams | null>(() => {
    if (!data) {
      return null;
    }

    return data[mappingName] || {};
  }, [data, mappingName]);

  return { data: returnData, error, mutate };
}
