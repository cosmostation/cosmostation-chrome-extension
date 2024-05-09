import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ONEINCH_SWAP_BASE_URL } from '~/constants/1inch';
import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { get } from '~/Popup/utils/axios';
import { hexToDecimal, isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { Assets } from '~/types/1inch/swap';

import { useTokensSWR } from '../../../ethereum/useTokensSWR';

export function useOneInchTokensSWR(chainId?: string, config?: SWRConfiguration) {
  const parsedChainId = useMemo(() => hexToDecimal(chainId), [chainId]);

  const requestURL = useMemo(() => `${ONEINCH_SWAP_BASE_URL}/${parsedChainId || ''}/tokens`, [parsedChainId]);

  const fetcher = (fetchUrl: string) => get<Assets>(fetchUrl, { headers: { Authorization: `Bearer ${String(process.env.ONEINCH_API_KEY)}` } });

  const { data, error, mutate } = useSWR<Assets, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => !parsedChainId,
    ...config,
  });

  const chain = useMemo(() => ETHEREUM_NETWORKS.find((item) => String(parseInt(item.chainId, 16)) === parsedChainId), [parsedChainId]);
  const tokens = useTokensSWR(chain);

  const returnData = useMemo(() => {
    if (!data) return [];

    const tokenValues = Object.values(data.tokens);

    return tokenValues.map((item) => {
      const registeredToken = tokens.data?.find((token) => isEqualsIgnoringCase(token.address, item.address));

      return {
        ...item,
        logoURI: item.tags.includes('native') ? chain?.tokenImageURL : registeredToken?.imageURL || item.logoURI,
        coinGeckoId: registeredToken?.coinGeckoId,
      };
    });
  }, [chain?.tokenImageURL, data, tokens.data]);

  return { data: returnData, error, mutate };
}
