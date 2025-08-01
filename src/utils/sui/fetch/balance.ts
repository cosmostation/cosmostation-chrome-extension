import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { SuiGetBalance, SuiRpcGetBalanceResponse } from '@/types/sui/api';
import { postWithFullResponse } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

export const fetchSuiBalances = async (address: string, rpcUrls: string[]): Promise<SuiGetBalance[]> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const body = {
      jsonrpc: '2.0',
      method: 'suix_getAllBalances',
      params: [address],
      id: 1,
    };

    const baseRpcUrl = rpcUrl;

    const response = await postWithFullResponse<SuiRpcGetBalanceResponse>(baseRpcUrl, body, {
      timeout: BALANCE_FETCH_TIME_OUT_MS,
    });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${baseRpcUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    const balance = response.data?.result ?? [];

    return balance;
  });
};
