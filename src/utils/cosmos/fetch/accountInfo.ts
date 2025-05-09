import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { AuthAccountsPayload } from '@/types/cosmos/account';
import { get } from '@/utils/axios';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { removeTrailingSlash } from '@/utils/string';

export const fetchCosmosAccountInfo = async (address: string, lcdUrls: string[]): Promise<AuthAccountsPayload> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    const base = removeTrailingSlash(lcdUrl);
    const urlPath = `/cosmos/auth/v1beta1/accounts/${address}`;
    const requestUrl = `${base}${urlPath}`;

    const response = await get<AuthAccountsPayload>(requestUrl, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
    });

    return response;
  });
};
