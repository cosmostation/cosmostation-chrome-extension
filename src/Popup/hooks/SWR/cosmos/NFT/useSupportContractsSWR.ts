import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { SupportedContract } from '~/types/cosmos/supportContracts';

import { useChainIdToAssetNameMapsSWR } from '../../useChainIdToAssetNameMapsSWR';

export function useSupportContractsSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR(config);

  const mappingName = useMemo(() => convertCosmosToAssetName(chain, chainIdToAssetNameMaps), [chain, chainIdToAssetNameMaps]);

  const requestURL = useMemo(() => `https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/${mappingName}/cw721.json`, [mappingName]);

  const fetcher = (fetchUrl: string) => get<SupportedContract[]>(fetchUrl);

  const { data, error, mutate } = useSWR<SupportedContract[], AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  return { data, error, mutate };
}
