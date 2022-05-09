import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { CRESCENT } from '~/constants/chain/tendermint/crescent';
import { EMONEY } from '~/constants/chain/tendermint/emoney';
import { GRAVITY_BRIDGE } from '~/constants/chain/tendermint/gravityBridge';
import { INJECTIVE } from '~/constants/chain/tendermint/injective';
import { KAVA } from '~/constants/chain/tendermint/kava';
import { SIF } from '~/constants/chain/tendermint/sif';
import { get } from '~/Popup/utils/axios';
import type { TendermintChain } from '~/types/chain';
import type { AssetPayload } from '~/types/tendermint/asset';

const nameMap = {
  [GRAVITY_BRIDGE.id]: 'gravity-bridge',
  [SIF.id]: 'sifchain',
  [INJECTIVE.id]: 'injective',
  [KAVA.id]: 'kava',
  [CRESCENT.id]: 'crescent',
  [EMONEY.id]: 'emoney',
};

export function useAssetsSWR(chain: TendermintChain, suspense?: boolean) {
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
