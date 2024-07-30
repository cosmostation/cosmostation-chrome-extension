import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { SKIP_BASE_URL } from '~/constants/skip';
import { post } from '~/Popup/utils/axios';
import { buildRequestUrl } from '~/Popup/utils/fetch';
import type { Affiliates, SkipRoutePayload, SkipSwapTxPayload } from '~/types/swap/skip';

type SkipRouteError = {
  code: string;
  message: string;
};

type FetchProps = {
  fetchUrl: string;
  skipSwapTxParam?: SkipSwapTxParam;
};

type SkipSwapTxParamProps = {
  addresses: string[];
  slippage: string;
  affiliates?: Affiliates;
};

export type SkipSwapTxParam = SkipRoutePayload & SkipSwapTxParamProps;

type UseSkipSwapTxSWRProps = {
  skipSwapTxParam?: SkipSwapTxParam;
};

export function useSkipSwapTxSWR({ skipSwapTxParam: swapTxParam }: UseSkipSwapTxSWRProps, config?: SWRConfiguration) {
  const requestURL = buildRequestUrl(SKIP_BASE_URL, '/v2/fungible/msgs');

  const fetcher = async ({ fetchUrl, skipSwapTxParam }: FetchProps) =>
    post<SkipSwapTxPayload>(
      fetchUrl,
      {
        source_asset_denom: skipSwapTxParam?.source_asset_denom,
        source_asset_chain_id: skipSwapTxParam?.source_asset_chain_id,
        dest_asset_denom: skipSwapTxParam?.dest_asset_denom,
        dest_asset_chain_id: skipSwapTxParam?.dest_asset_chain_id,
        amount_in: skipSwapTxParam?.amount_in,
        address_list: skipSwapTxParam?.addresses,
        operations: skipSwapTxParam?.operations,
        amount_out: skipSwapTxParam?.amount_out,
        slippage_tolerance_percent: skipSwapTxParam?.slippage,
        chain_ids_to_affiliates: skipSwapTxParam?.affiliates || {},
      },
      { headers: { authorization: `${String(process.env.SKIP_API_KEY)}` } },
    );

  const { data, isValidating, error, mutate } = useSWR<SkipSwapTxPayload, AxiosError<SkipRouteError>>(
    { fetchUrl: requestURL, skipSwapTxParam: swapTxParam },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !swapTxParam || !requestURL,
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
