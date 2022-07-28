import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ETHEREUM } from '~/constants/chain/ethereum/network/ethereum';
import { SMART_CHAIN } from '~/constants/chain/ethereum/network/smartChain';
import { get } from '~/Popup/utils/axios';
import { toHex } from '~/Popup/utils/common';
import type { AssetPayload, ModifiedAsset } from '~/types/ethereum/asset';

import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

const nameMap = {
  [ETHEREUM.id]: 'ethereum',
  [SMART_CHAIN.id]: 'smart-chain',
};

export function useTokensSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const mappingName = nameMap[currentEthereumNetwork.id] || currentEthereumNetwork.networkName.toLowerCase();

  const requestURL = `https://api.mintscan.io/v2/assets/erc20/${mappingName}`;

  const fetcher = async (fetchUrl: string) => {
    try {
      return await get<AssetPayload>(fetchUrl);
    } catch (e: unknown) {
      return null;
    }
  };

  const { data, error, mutate } = useSWR<AssetPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    ...config,
  });

  const returnData: ModifiedAsset[] =
    data?.assets.map((item) => ({
      chainId: toHex(item.chainId, { addPrefix: true }),
      address: item.address,
      decimals: item.decimals,
      name: item.name,
      displayDenom: item.symbol,
      imageURL: item.logoURI
        ? item.logoURI.startsWith('http://') || item.logoURI.startsWith('https://')
          ? item.logoURI
          : `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/${item.logoURI}`
        : undefined,
      coinGeckoId: item.coinGeckoId,
    })) || [];

  return { data: returnData, error, mutate };
}
