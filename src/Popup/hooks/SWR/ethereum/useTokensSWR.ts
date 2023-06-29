import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ETHEREUM } from '~/constants/chain/ethereum/network/ethereum';
import { KAVA } from '~/constants/chain/ethereum/network/kava';
import { SMART_CHAIN } from '~/constants/chain/ethereum/network/smartChain';
import { get } from '~/Popup/utils/axios';
import { toHex } from '~/Popup/utils/string';
import type { AssetPayload, ModifiedAsset } from '~/types/ethereum/asset';

import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

const nameMap = {
  [ETHEREUM.id]: 'ethereum',
  [SMART_CHAIN.id]: 'smart-chain',
  [KAVA.id]: 'kava',
};

export function useTokensSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const mappingName = nameMap[currentEthereumNetwork.id] || currentEthereumNetwork.networkName.toLowerCase();

  const requestURL = `https://api.mintscan.io/v3/assets/${mappingName}/erc20`;

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
      name: item.description,
      displayDenom: item.symbol,
      imageURL: item.image ? `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${item.image}` : undefined,
      coinGeckoId: item.coinGeckoId,
      default: item.default ?? false,
    })) || [];

  return { data: returnData, error, mutate };
}
