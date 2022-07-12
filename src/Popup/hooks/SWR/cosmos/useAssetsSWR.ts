import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { CRESCENT } from '~/constants/chain/cosmos/crescent';
import { EMONEY } from '~/constants/chain/cosmos/emoney';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { SIF } from '~/constants/chain/cosmos/sif';
import { get } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { AssetV2Payload } from '~/types/cosmos/asset';

const nameMap = {
  [GRAVITY_BRIDGE.id]: 'gravity-bridge',
  [SIF.id]: 'sifchain',
  [INJECTIVE.id]: 'injective',
  [KAVA.id]: 'kava',
  [CRESCENT.id]: 'crescent',
  [EMONEY.id]: 'emoney',
};

export function useAssetsSWR(chain: CosmosChain, config?: SWRConfiguration) {
  const mappingName = nameMap[chain.chainName] || chain.chainName.toLowerCase();

  const requestURL = `https://api.mintscan.io/v2/assets/${mappingName}`;

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
    isPaused: () => !mappingName,
    ...config,
  });

  const returnData = data?.assets || [];

  return { data: returnData, error, mutate };
}
