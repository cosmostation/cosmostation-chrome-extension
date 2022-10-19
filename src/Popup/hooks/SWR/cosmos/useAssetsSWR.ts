import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ASSET_MANTLE } from '~/constants/chain/cosmos/assetMantle';
import { CRESCENT } from '~/constants/chain/cosmos/crescent';
import { CRYPTO_ORG } from '~/constants/chain/cosmos/cryptoOrg';
import { EMONEY } from '~/constants/chain/cosmos/emoney';
import { FETCH_AI } from '~/constants/chain/cosmos/fetchAi';
import { GRAVITY_BRIDGE } from '~/constants/chain/cosmos/gravityBridge';
import { INJECTIVE } from '~/constants/chain/cosmos/injective';
import { KAVA } from '~/constants/chain/cosmos/kava';
import { KI } from '~/constants/chain/cosmos/ki';
import { SIF } from '~/constants/chain/cosmos/sif';
import { STAFIHUB } from '~/constants/chain/cosmos/stafihub';
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
  [STAFIHUB.id]: 'stafi',
  [CRYPTO_ORG.id]: 'crypto-org',
  [KI.id]: 'ki-chain',
  [ASSET_MANTLE.id]: 'asset-mantle',
  [FETCH_AI.id]: 'fetchai',
};

export function useAssetsSWR(chain?: CosmosChain, config?: SWRConfiguration) {
  const mappingName = chain ? nameMap[chain.id] || chain.chainName.toLowerCase() : '';

  const requestURL = 'https://api.mintscan.io/v2/assets';

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<AssetV2Payload>(fetchUrl);
    } catch {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<AssetV2Payload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const assets = useMemo(() => data?.assets || [], [data?.assets]);

  const returnData = useMemo(() => (mappingName ? assets.filter((item) => item.chain === mappingName) : assets), [assets, mappingName]);

  return { data: returnData, error, mutate, isLoading: data === undefined };
}
