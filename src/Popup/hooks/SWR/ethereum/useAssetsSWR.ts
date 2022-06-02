import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { MAINNET } from '~/constants/chain/ethereum/network/mainnet';
import { get } from '~/Popup/utils/axios';
import type { AssetPayload } from '~/types/ethereum/asset';

import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

export function useAssetsSWR(config?: SWRConfiguration) {
  const { currentNetwork } = useCurrentEthereumNetwork();

  const requestURL = currentNetwork.id === MAINNET.id ? `https://api.mintscan.io/v1/assets/ethereum` : '';

  const fetcher = (fetchUrl: string) => get<AssetPayload>(fetchUrl);

  const { data, error, mutate } = useSWR<AssetPayload, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => currentNetwork.id !== MAINNET.id,
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
