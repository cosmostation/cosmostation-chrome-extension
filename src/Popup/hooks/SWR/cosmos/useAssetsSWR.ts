import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { get } from '~/Popup/utils/axios';
import { convertCosmosToAssetName } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { AssetV2Payload } from '~/types/cosmos/asset';

export function useAssetsSWR(chain?: CosmosChain, config?: SWRConfiguration) {
  const mappingName = chain ? convertCosmosToAssetName(chain) : '';

  const requestURL = 'https://api.mintscan.io/v2/assets';

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<AssetV2Payload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<AssetV2Payload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const assets = useMemo(
    () =>
      data?.assets.map((item) => {
        const prevChain = (() => {
          if (item.counter_party && item.path) {
            const splitedPath = item.path.split('>');

            return chain ? splitedPath[splitedPath.length - 2] : splitedPath[splitedPath.length - 1];
          }

          return '';
        })();
        return { ...item, prevChain };
      }) || [],
    [chain, data?.assets],
  );

  const returnData = useMemo(() => (mappingName ? assets.filter((item) => item.chain === mappingName) : assets), [assets, mappingName]);

  return { data: returnData, error, mutate };
}
