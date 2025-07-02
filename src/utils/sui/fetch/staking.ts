import axios from 'axios';
import type { DelegatedStake as SuiDelegatedStake } from '@mysten/sui/client';

import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { SuiRpcGetDelegatedStakeResponse } from '@/types/sui/api';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

export const fetchSuiDelegations = async (address: string, rpcUrls: string[]): Promise<SuiDelegatedStake[]> => {
  return await fetchWithFailover(rpcUrls, async (lcdUrl) => {
    const requestUrl = lcdUrl;

    const body = {
      jsonrpc: '2.0',
      method: 'suix_getStakes',
      params: [address],
      id: 1,
    };

    const response = await axios.post<SuiRpcGetDelegatedStakeResponse>(requestUrl, body, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS * 2,
    });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${requestUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    return response.data.result || [];
  });
};
