import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { CURRENCY_TYPE } from '~/constants/chromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { get } from '~/Popup/utils/axios';
import type { TendermintChain } from '~/types/chain';
import type { SimplePrice } from '~/types/coinGecko';

export function useCoinGeckoPriceSWR(suspense?: boolean) {
  const { currentAllowedChains } = useCurrentAllowedChains();
  const { currentNetwork } = useCurrentNetwork();

  const ethereumCoinGeckoId = currentNetwork.coinGeckoId ? `,${currentNetwork.coinGeckoId}` : '';

  const coinGeckoIds = `${(currentAllowedChains.filter((chain) => chain.line === 'TENDERMINT' && chain.coinGeckoId) as TendermintChain[])
    .map((chain) => chain.coinGeckoId)
    .join(',')}${ethereumCoinGeckoId},tether`;

  const currencySymbols = Object.values(CURRENCY_TYPE).join(',');

  const requestURL = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=${currencySymbols}&ids=${coinGeckoIds}&include_market_cap=true&include_24hr_change=true`;

  const fetcher = (fetchUrl: string) => get<SimplePrice>(fetchUrl);

  const { data, error, mutate } = useSWR<SimplePrice, AxiosError>(requestURL, fetcher, {
    refreshInterval: 15000,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    revalidateOnFocus: false,
    suspense,
  });

  return { data, error, mutate };
}
