import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';

import { EthereumRPCError } from './error';

export async function requestRPC<T>(method: string, params: unknown, id?: string | number, url?: string) {
  const rpcURL = url;

  const rpcId = id ?? new Date().getTime();

  try {
    if (!rpcURL) {
      throw new Error('RPC URL is not defined');
    }

    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cosmostation: `extension/${String(process.env.VERSION)}`,
      },
      body: JSON.stringify({ method, params, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new EthereumRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}
