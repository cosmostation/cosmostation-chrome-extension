import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { CosmosBalance, CosmosBalanceResponse, CosmosCw20BalanceResponse } from '@/types/cosmos/api';
import { getWithFullResponse } from '@/utils/axios';
import { buildRequestUrl } from '@/utils/fetch';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

export const fetchCosmosBalances = async (
  address: string,
  lcdUrls: string[],
  option?: {
    path: string;
  },
): Promise<CosmosBalance[]> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    let nextKey: string | null = null;
    const responseBalances: CosmosBalance[][] = [];

    const urlPath = option?.path || `/cosmos/bank/v1beta1/balances/${address}`;

    const requestUrl = buildRequestUrl(lcdUrl, urlPath, {
      'pagination.limit': '2000',
    });

    const response = await getWithFullResponse<CosmosBalanceResponse>(requestUrl, {
      timeout: BALANCE_FETCH_TIME_OUT_MS,
    });

    const initialResponse = response.data;

    nextKey = initialResponse?.pagination?.next_key ?? null;
    responseBalances.push(initialResponse?.balances ?? []);

    while (nextKey) {
      try {
        const paginatedRequestUrl = `${requestUrl}&pagination.key=${encodeURIComponent(nextKey)}`;

        const paginatedResponse = await getWithFullResponse<CosmosBalanceResponse>(paginatedRequestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        const paginatedData = paginatedResponse.data;

        nextKey = paginatedData?.pagination?.next_key ?? null;
        responseBalances.push(paginatedData?.balances ?? []);
      } catch {
        nextKey = null;
      }
    }

    const balances = responseBalances.flat();
    return balances;
  });
};

export const fetchCoreumSpendableBalances = async (address: string, lcdUrls: string[]): Promise<CosmosBalance[]> => {
  return await fetchCosmosBalances(address, lcdUrls, {
    path: `/cosmos/bank/v1beta1/spendable_balances/${address}`,
  });
};

export const fetchCW20Balances = async (address: string, contractAddress: string, lcdUrls: string[]): Promise<string> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    const urlPath = `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodeURIComponent(btoa(`{"balance":{"address":"${address}"}}`))}`;

    const requestUrl = buildRequestUrl(lcdUrl, urlPath);

    const response = await getWithFullResponse<CosmosCw20BalanceResponse>(requestUrl, {
      timeout: BALANCE_FETCH_TIME_OUT_MS,
    });

    return response.data?.data?.balance ?? '0';
  });
};
