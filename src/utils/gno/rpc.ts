import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';

import { GnoRPCError } from '../error';

interface GnoRPCParams {
  path: string;
  data?: string;
  height?: string;
  prove?: boolean;
}

export async function requestRPC<T>(url: string, method: string, params: GnoRPCParams, id?: string | number) {
  const rpcURL = url;

  const rpcId = id ?? new Date().getTime();

  const requestParams = [params.path, params.data || '', params.height || '0', typeof params.prove === 'undefined' ? false : params.prove];

  try {
    const response = await fetch(rpcURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cosmostation: `extension/${String(__APP_VERSION__)}`,
      },
      body: JSON.stringify({ method, params: requestParams, jsonrpc: '2.0', id: rpcId }),
    });

    const responseJSON = (await response.json()) as { id?: number | string };

    if (id === undefined) {
      delete responseJSON?.id;
    }

    return responseJSON as unknown as T;
  } catch {
    throw new GnoRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], rpcId);
  }
}
