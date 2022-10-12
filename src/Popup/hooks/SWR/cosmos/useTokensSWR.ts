import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { JUNO } from '~/constants/chain/cosmos/juno';
import { get } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { CW20AssetPayload } from '~/types/cosmos/asset';

const nameMap = {
  [JUNO.id]: 'juno',
};

export function useTokensSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const mappingName = nameMap[chain.id] || chain.chainName.toLowerCase();

  const requestURL = `https://api.mintscan.io/v2/assets/${mappingName}/cw20`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<CW20AssetPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<CW20AssetPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !(chain.line === 'COSMOS' && chain.cosmWasm),
    ...config,
  });

  const returnData: CW20AssetPayload['assets'] = data?.assets
    ? [
        ...data.assets.map((item) => ({
          ...item,
          logo: item.logo
            ? item.logo.startsWith('http://') || item.logo.startsWith('https://')
              ? item.logo
              : `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${item.logo}`
            : undefined,
        })),
      ]
    : [];

  return { data: returnData, error, mutate };
}
