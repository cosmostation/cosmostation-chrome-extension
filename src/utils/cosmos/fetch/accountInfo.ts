import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { AuthAccountsPayload } from '@/types/cosmos/account';
import { get } from '@/utils/axios';
import { buildRequestUrl } from '@/utils/fetch';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

export const fetchCosmosAccountInfo = async (address: string, lcdUrls: string[]): Promise<AuthAccountsPayload> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    const urlPath = `/cosmos/auth/v1beta1/accounts/${address}`;

    const requestUrl = buildRequestUrl(lcdUrl, urlPath);

    const response = await get<AuthAccountsPayload>(requestUrl, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
    });

    return response;
  });
};
