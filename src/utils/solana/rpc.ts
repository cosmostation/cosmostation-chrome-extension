import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';

import { SolanaRPCError } from '../error';
import { getSolanaDefaultStorageData } from '../storage/localStorage';

export async function requestRPC<T>(method: string, params: unknown, id?: string | number, url?: string) {
  const storageData = await getSolanaDefaultStorageData();
  const currentSolanaNetwork = storageData?.currentSolanaNetwork;

  const rpcURL = url || currentSolanaNetwork?.rpcUrls?.[0]?.url;

  const rpcId = id ?? new Date().getTime();

  try {
    if (!rpcURL) {
      throw new Error('RPC URL is not defined');
    }

    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cosmostation: `extension/${__APP_VERSION__}`,
      },
      body: JSON.stringify({ method, params, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new SolanaRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}
