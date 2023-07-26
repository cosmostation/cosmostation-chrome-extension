import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { post } from '~/Popup/utils/axios';
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
  chainIdsToAddresses: ChainIdToAddressMap;
  slippage: string;
  affiliates?: Affiliates[];
};

type ChainIdToAddressMap = {
  [chainId: string]: string;
};

export type SkipSwapTxParam = SkipRoutePayload & SkipSwapTxParamProps;

type UseSkipSwapTxSWRProps = {
  swapTxParam?: SkipSwapTxParam;
};

export function useSkipSwapTxSWR({ swapTxParam }: UseSkipSwapTxSWRProps, config?: SWRConfiguration) {
  const requestURL = ' https://api.skip.money/v1/fungible/msgs';

  const fetcher = async ({ fetchUrl, skipSwapTxParam }: FetchProps) =>
    post<SkipSwapTxPayload>(fetchUrl, {
      source_asset_denom: skipSwapTxParam?.source_asset_denom,
      source_asset_chain_id: skipSwapTxParam?.source_asset_chain_id,
      dest_asset_denom: skipSwapTxParam?.dest_asset_denom,
      dest_asset_chain_id: skipSwapTxParam?.dest_asset_chain_id,
      amount_in: skipSwapTxParam?.amount_in,
      chain_ids_to_addresses: skipSwapTxParam?.chainIdsToAddresses,
      operations: skipSwapTxParam?.operations,
      estimated_amount_out: skipSwapTxParam?.estimated_amount_out,
      slippage_tolerance_percent: skipSwapTxParam?.slippage,
      affiliates: skipSwapTxParam?.affiliates || [],
    });

  const { data, isValidating, error, mutate } = useSWR<SkipSwapTxPayload, AxiosError<SkipRouteError>>(
    { fetchUrl: requestURL, skipSwapTxParam: swapTxParam },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
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
