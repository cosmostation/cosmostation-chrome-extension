import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
import type { SkipRoutePayload } from '~/types/swap/skip';

import { useCurrentChain } from '../../../../useCurrent/useCurrentChain';

type SkipRouteError = {
  code: string;
  message: string;
};

type FetchProps = {
  fetchUrl: string;
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
  const { currentChain } = useCurrentChain();

  const requestURL = 'https://api.skip.money/v1/fungible/route';

  const fetcher = async ({ fetchUrl, skipRouteParam }: FetchProps) =>
    post<SkipRoutePayload>(fetchUrl, {
      amount_in: skipRouteParam?.amountIn,
      source_asset_denom: skipRouteParam?.sourceAssetDenom,
      source_asset_chain_id: skipRouteParam?.sourceAssetChainId,
      dest_asset_denom: skipRouteParam?.destAssetDenom,
      dest_asset_chain_id: skipRouteParam?.destAssetChainId,
      cumulative_affiliate_fee_bps: skipRouteParam?.cumulativeAffiliateFeeBps,
    });

  const { data, isValidating, error, mutate } = useSWR<SkipRoutePayload, AxiosError<SkipRouteError>>(
    { fetchUrl: requestURL, skipRouteParam: routeParam },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      isPaused: () => currentChain.line !== 'COSMOS' || !routeParam || !requestURL,
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
