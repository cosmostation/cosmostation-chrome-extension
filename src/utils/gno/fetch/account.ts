import type { GnoAbciQueryResponse } from '@/types/gno/rpc';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';

import { requestRPC } from '../rpc';

export const fetchGnoAccount = async (address: string, rpcUrls: string[]) => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const path = `auth/accounts/${address}`;

    const response = await requestRPC<GnoAbciQueryResponse>(rpcUrl, 'abci_query', { path });

    if (response.error) {
      throw new Error(`[RPC Error] URL: ${rpcUrl}, Method: abci_query, Message: ${response.error?.message}`);
    }

    if (response?.result?.response?.ResponseBase?.Data) {
      const parsedData = JSON.parse(atob(response.result.response.ResponseBase.Data));

      if (!parsedData) {
        return null;
      }

      const account = {
        account_number: findValueByKey<string>(parsedData, 'account_number'),
        sequence: findValueByKey<string>(parsedData, 'sequence'),
        address: findValueByKey<string>(parsedData, 'address'),
        publicKey: findValueByKey<{ '@type': string; value: string } | null>(parsedData, 'public_key'),
      };

      return account;
    }

    return null;
  });
};

function findValueByKey<T>(obj: Record<string | number, unknown>, inputKey: string) {
  if (obj?.[inputKey]) {
    return obj[inputKey] as T;
  }

  const keys = Object.keys(obj);

  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      return findValueByKey(value as Record<string, unknown>, inputKey);
    }
  }

  return undefined;
}
