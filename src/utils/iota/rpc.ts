import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';

import { IotaRPCError } from '../error';
import { extensionLocalStorage } from '../storage';

export async function requestRPC<T>(method: string, params: unknown, id?: string | number, url?: string) {
  const { currentIotaNetwork } = await extensionLocalStorage();

  const rpcURL = url ?? currentIotaNetwork.rpcUrls[0].url;

  const rpcId = id ?? new Date().getTime();

  try {
    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cosmostation: `extension/${String(__APP_VERSION__)}`,
      },
      body: JSON.stringify({ method, params, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new IotaRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}
