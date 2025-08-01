import type { DelegatedStake as SuiDelegatedStake } from '@mysten/sui/client';

import { STAKING_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { SuiRpcGetDelegatedStakeResponse } from '@/types/sui/api';
import { postWithFullResponse } from '@/utils/axios';
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

    const response = await postWithFullResponse<SuiRpcGetDelegatedStakeResponse>(requestUrl, body, {
      timeout: STAKING_FETCH_TIME_OUT_MS,
    });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${requestUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    return response.data.result || [];
  });
};
