import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { CURRENCY_TYPE } from '~/constants/chromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { get } from '~/Popup/utils/axios';
import type { CosmosChain } from '~/types/chain';
import type { SimplePrice } from '~/types/payload/coingecko';

type useCoinGeckoPriceProps = {
  suspense?: boolean;
};

export function useCoinGeckoPrice(props?: useCoinGeckoPriceProps) {
  const { currentAllowedChains } = useCurrentAllowedChains();
  const { currentNetwork } = useCurrentNetwork();

  const ethereumCoinGeckoId = currentNetwork.coingeckoId ? `,${currentNetwork.coingeckoId}` : '';

  const coinGeckoIds = `${(currentAllowedChains.filter((chain) => chain.line === 'COSMOS' && chain.coingeckoId) as CosmosChain[])
    .map((chain) => chain.coingeckoId)
    .join(',')}${ethereumCoinGeckoId}`;

  const currencySymbols = Object.values(CURRENCY_TYPE).join(',');

  const requestURL = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=${currencySymbols}&ids=${coinGeckoIds}&include_market_cap=true&include_24hr_change=true`;

  const fetcher = (fetchUrl: string) => get<SimplePrice>(fetchUrl);

  const { data, error, mutate } = useSWR<SimplePrice, AxiosError>(requestURL, fetcher, {
    refreshInterval: 0,
    errorRetryCount: 5,
    errorRetryInterval: 3000,
    revalidateOnFocus: false,
    suspense: props?.suspense,
  });

  return { data, error, mutate };
}
