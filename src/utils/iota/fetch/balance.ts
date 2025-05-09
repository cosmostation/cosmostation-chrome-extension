import axios from 'axios';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { IotaGetBalance, IotaRpcGetBalanceResponse } from '@/types/iota/api';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { removeTrailingSlash } from '@/utils/string';

export const fetchIotaBalances = async (address: string, rpcUrls: string[]): Promise<IotaGetBalance[]> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const body = {
      jsonrpc: '2.0',
      method: 'iotax_getAllBalances',
      params: [address],
      id: 1,
    };

    const baseRpcUrl = removeTrailingSlash(rpcUrl);

    const response = await axios.post<IotaRpcGetBalanceResponse>(baseRpcUrl, body, {
      timeout: BALANCE_FETCH_TIME_OUT_MS,
    });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${baseRpcUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    const balance = response.data?.result ?? [];

    return balance;
  });
};
