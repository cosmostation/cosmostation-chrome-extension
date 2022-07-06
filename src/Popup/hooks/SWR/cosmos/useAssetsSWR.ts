import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { CRESCENT } from '~/constants/chain/cosmos/crescent';
import { EMONEY } from '~/constants/chain/cosmos/emoney';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { SIF } from '~/constants/chain/cosmos/sif';
import { get } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { AssetPayload } from '~/types/cosmos/asset';

const nameMap = {
  [GRAVITY_BRIDGE.id]: 'gravity-bridge',
  [SIF.id]: 'sifchain',
  [INJECTIVE.id]: 'injective',
  [KAVA.id]: 'kava',
  [CRESCENT.id]: 'crescent',
  [EMONEY.id]: 'emoney',
};

export function useAssetsSWR(chain: CosmosChain, suspense?: boolean) {
  const mappingName = nameMap[chain.id];

  const requestURL = `https://api.mintscan.io/v1/assets/${mappingName}`;

  const fetcher = (fetchUrl: string) => get<AssetPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<AssetPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    suspense,
    isPaused: () => !mappingName,
  });

  const returnData = data?.assets || [];

  return { data: returnData, error, mutate };
}
