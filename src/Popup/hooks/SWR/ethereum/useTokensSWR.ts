import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ETHEREUM as NETWORK_ETHEREUM } from '~/constants/chain/ethereum/network/ethereum';
import { get } from '~/Popup/utils/axios';
import type { AssetPayload } from '~/types/ethereum/asset';

import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

export function useTokensSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const requestURL = currentEthereumNetwork.id === NETWORK_ETHEREUM.id ? `https://api.mintscan.io/v1/assets/ethereum` : '';

  const fetcher = (fetchUrl: string) => get<AssetPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<AssetPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => currentEthereumNetwork.id !== NETWORK_ETHEREUM.id,
    ...config,
  });

  const returnData =
    data?.assets.map((item) => ({
      ...item,
      imageURL:
        (item.image && `https://raw.githubusercontent.com/cosmostation/cosmostation_token_resource/master/assets/images/ethereum/${item.image}`) || undefined,
    })) || [];

  return { data: returnData, error, mutate };
}
