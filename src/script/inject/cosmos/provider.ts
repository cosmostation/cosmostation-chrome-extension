import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import type { BaseRequest } from '@/types/message/inject';
import type {
  CosRequestAccountResponse,
  CosRequestAccounts,
  CosSendTransaction,
  CosSignDirect,
  CosSignDirectParams,
  CosSignDirectResponse,
  CosSignDirectResponseWebToApp,
  CosSupportedChainIdsResponse,
  SignDirectDocWebToApp,
} from '@/types/message/inject/cosmos';
import { CosmosRPCError } from '@/utils/error';

import { requestApp } from '..';

export const cosmosRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'cosmos',
  };

  return requestApp(requestParam);
};

function isCosRequestAccounts(message: BaseRequest): message is CosRequestAccounts {
  return message.method === 'cos_requestAccounts';
}

function isCosSignDirect(message: BaseRequest): message is CosSignDirect {
  return message.method === 'cos_signDirect';
}

function isCosSendTransaction(message: BaseRequest): message is CosSendTransaction {
  return message.method === 'cos_sendTransaction';
}

export const wrappedCosmosRequestApp = async <T extends BaseRequest>(message: T) => {
  if (message.method === 'cos_requestAccount' || message.method === 'cos_account') {
    const result = (await cosmosRequestApp(message)) as CosRequestAccountResponse;

    const { publicKey } = result;

    const response = {
      ...(result as { publicKey: string; address: string }),
      publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')),
    };

    return response;
  }

  if (isCosRequestAccounts(message)) {
    const supportedChainIds = (await cosmosRequestApp({
      method: 'cos_supportedChainIds',
      params: undefined,
    })) as CosSupportedChainIdsResponse;

    const isValidChainIds = message.params?.chainIds?.every(
      (chainId: string) => supportedChainIds?.official?.includes(chainId) || supportedChainIds?.unofficial?.includes(chainId),
    );

    if (!isValidChainIds) {
      throw new CosmosRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS]);
    }

    const initialAccountRequestMessage = {
      ...message,
      method: 'cos_requestAccount',
      params: {
        chainName: message.params?.chainIds?.[0],
      },
    };

    await cosmosRequestApp(initialAccountRequestMessage);

    const result = await Promise.all(
      message.params.chainIds.map(
        async (chainId: string) =>
          (await cosmosRequestApp({
            method: 'cos_requestAccount',
            params: { chainName: chainId },
          })) as CosRequestAccountResponse,
      ),
    );

    const response = result.map((item) => {
      const { publicKey } = item;

      return {
        ...(item as { publicKey: string; address: string }),
        publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')),
      };
    });

    return response;
  }

  if (isCosSignDirect(message)) {
    const { params } = message;

    const doc = params?.doc;

    const newDoc: SignDirectDocWebToApp = doc
      ? {
          ...doc,
          auth_info_bytes: Buffer.from(doc.auth_info_bytes).toString('hex'),
          body_bytes: Buffer.from(doc.body_bytes).toString('hex'),
        }
      : doc;

    const newParams: CosSignDirectParams = params ? { ...params, doc: newDoc } : params;
    const newMessage = { ...message, params: newParams };

    const result = (await cosmosRequestApp(newMessage)) as CosSignDirectResponseWebToApp;

    const response: CosSignDirectResponse = {
      ...result,
      signed_doc: {
        ...result.signed_doc,
        auth_info_bytes: new Uint8Array(Buffer.from(result.signed_doc.auth_info_bytes, 'hex')).buffer,
        body_bytes: new Uint8Array(Buffer.from(result.signed_doc.body_bytes, 'hex')).buffer,
      },
    };

    return response;
  }

  if (isCosSendTransaction(message)) {
    const { params } = message;

    const txBytes = params?.txBytes && typeof params.txBytes === 'object' ? Buffer.from(params.txBytes).toString('base64') : params.txBytes;

    const newParams = { ...params, txBytes };
    const newMessage = { ...message, params: newParams };

    return cosmosRequestApp(newMessage);
  }

  return cosmosRequestApp(message);
};

export const cosmosProvider: CosmosProvider = {
  // on,
  // off,
  request: cosmosRequestApp,
};
