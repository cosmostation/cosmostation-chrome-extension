import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { NETWORKS } from '~/constants/chain';
import { CURRENCY_TYPE } from '~/constants/chromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { get } from '~/Popup/utils/axios';
import type { TendermintChain } from '~/types/chain';
import type { SimplePrice } from '~/types/coinGecko';

import { useChromeStorage } from '../useChromeStorage';

export function useCoinGeckoPriceSWR(suspense?: boolean) {
  const { currentAllowedChains } = useCurrentAllowedChains();

  const { chromeStorage } = useChromeStorage();

  const { additionalEthereumNetworks } = chromeStorage;
  const networkCoingeckoIds = [...NETWORKS, ...additionalEthereumNetworks].filter((item) => !!item.coinGeckoId).map((item) => item.coinGeckoId);

  const joinedNetworkCoingeckoIds = networkCoingeckoIds.length > 0 ? `,${networkCoingeckoIds.join(',')}` : '';

  const coinGeckoIds = `${(currentAllowedChains.filter((chain) => chain.line === 'TENDERMINT' && chain.coinGeckoId) as TendermintChain[])
    .map((chain) => chain.coinGeckoId)
    .join(',')}${joinedNetworkCoingeckoIds},tether`;

  const currencySymbols = Object.values(CURRENCY_TYPE).join(',');

  const requestURL = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=${currencySymbols}&ids=${coinGeckoIds}&include_market_cap=true&include_24hr_change=true`;

  const fetcher = (fetchUrl: string) => get<SimplePrice>(fetchUrl);

  const { data, error, mutate } = useSWR<SimplePrice, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    suspense,
  });

  return { data, error, mutate };
}
