import axios from 'axios';
import type { DelegatedStake as IotaDelegatedStake } from '@iota/iota-sdk/client';

import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { IotaRpcGetDelegatedStakeResponse } from '@/types/iota/api';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { removeTrailingSlash } from '@/utils/string';

export const fetchIotaDelegations = async (address: string, rpcUrls: string[]): Promise<IotaDelegatedStake[]> => {
  return await fetchWithFailover(rpcUrls, async (lcdUrl) => {
    const requestUrl = removeTrailingSlash(lcdUrl);

    const body = {
      jsonrpc: '2.0',
      method: 'iotax_getStakes',
      params: [address],
      id: 1,
    };

    const response = await axios.post<IotaRpcGetDelegatedStakeResponse>(requestUrl, body, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
    });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${requestUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    return response.data.result || [];
  });
};
