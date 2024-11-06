import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MINTSCAN_FRONT_API_V11_URL } from '~/constants/common';
import { get } from '~/Popup/utils/axios';
import { convertEVMToAssetName } from '~/Popup/utils/ethereum';
import { toHex } from '~/Popup/utils/string';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC20AssetV11Response, ModifiedAsset } from '~/types/ethereum/asset';

import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';
import { useChainIdToAssetNameMapsSWR } from '../useChainIdToAssetNameMapsSWR';

export function useTokensSWR(chain?: EthereumNetwork, config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR();

  const currentChain = chain || currentEthereumNetwork;

  const mappingName = useMemo(() => convertEVMToAssetName(currentChain, chainIdToAssetNameMaps), [chainIdToAssetNameMaps, currentChain]);

  const requestURL = useMemo(() => `${MINTSCAN_FRONT_API_V11_URL}/assets/${mappingName}/erc20/info`, [mappingName]);

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<ERC20AssetV11Response>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<ERC20AssetV11Response | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const returnData: ModifiedAsset[] =
    data?.map?.((item) => ({
      chainId: toHex(currentChain.chainId, { addPrefix: true }),
      address: item.contract,
      decimals: item.decimals,
      name: item.name,
      displayDenom: item.symbol,
      imageURL: item.image,
      coinGeckoId: item.coinGeckoId,
      default: item.wallet_preload || false,
    })) || [];

  return { data: returnData, error, mutate };
}
