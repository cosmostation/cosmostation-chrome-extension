import axios from 'axios';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { SuiGetBalance, SuiRpcGetBalanceResponse } from '@/types/sui/api';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { removeTrailingSlash } from '@/utils/string';

export const fetchSuiBalances = async (address: string, rpcUrls: string[]): Promise<SuiGetBalance[]> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const body = {
      jsonrpc: '2.0',
      method: 'suix_getAllBalances',
      params: [address],
      id: 1,
    };

    const baseRpcUrl = removeTrailingSlash(rpcUrl);

    const response = await axios.post<SuiRpcGetBalanceResponse>(baseRpcUrl, body, {
      timeout: BALANCE_FETCH_TIME_OUT_MS * 2,
    });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${baseRpcUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    const balance = response.data?.result ?? [];

    return balance;
  });
};
