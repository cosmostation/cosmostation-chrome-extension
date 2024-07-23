import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SKIP_BASE_URL } from '~/constants/skip';
import { post } from '~/Popup/utils/axios';
import { buildRequestUrl } from '~/Popup/utils/fetch';
import type { SkipRoutePayload } from '~/types/swap/skip';

import { useSkipAPIKeySWR } from './useSkipAPIKeySWR';

type SkipRouteError = {
  code: string;
  message: string;
};

type FetchProps = {
  fetchUrl: string;
  apiKey?: string;
  skipRouteParam?: SkipRouteProps;
};

export type SkipRouteProps = {
  amountIn: string;
  sourceAssetDenom: string;
  sourceAssetChainId: string;
  destAssetDenom: string;
  destAssetChainId: string;
  cumulativeAffiliateFeeBps: string;
};

type UseSkipRouteSWRProps = {
  routeParam?: SkipRouteProps;
};

export function useSkipRouteSWR({ routeParam }: UseSkipRouteSWRProps, config?: SWRConfiguration) {
  const skipAPIKey = useSkipAPIKeySWR(config);

  const requestURL = buildRequestUrl(SKIP_BASE_URL, '/v2/fungible/route');

  const fetcher = async ({ fetchUrl, apiKey, skipRouteParam }: FetchProps) =>
    post<SkipRoutePayload>(
      fetchUrl,
      {
        amount_in: skipRouteParam?.amountIn,
        source_asset_denom: skipRouteParam?.sourceAssetDenom,
        source_asset_chain_id: skipRouteParam?.sourceAssetChainId,
        dest_asset_denom: skipRouteParam?.destAssetDenom,
        dest_asset_chain_id: skipRouteParam?.destAssetChainId,
        cumulative_affiliate_fee_bps: skipRouteParam?.cumulativeAffiliateFeeBps,
      },
      apiKey ? { headers: { authorization: `${apiKey}` } } : undefined,
    );

  const { data, isValidating, error, mutate } = useSWR<SkipRoutePayload, AxiosError<SkipRouteError>>(
    { fetchUrl: requestURL, apiKey: skipAPIKey.data?.key, skipRouteParam: routeParam },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !routeParam || !requestURL,
      ...config,
    },
  );

  return {
    data,
    isValidating,
    error,
    mutate,
  };
}
