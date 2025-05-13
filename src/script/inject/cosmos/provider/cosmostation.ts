/* eslint-disable @typescript-eslint/no-empty-function */
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import type { SignDirectDoc } from '@/types/cosmos/direct';
import type { CosmosListenerType, EventDetail } from '@/types/message';
import type { BaseRequest } from '@/types/message/inject';
import type {
  CosRequestAccountResponse,
  CosRequestAccounts,
  CosRequestAccountsSettled,
  CosRequestAccountsSettledResponse,
  CosSendTransaction,
  CosSignDirect,
  CosSignDirectParams,
  CosSignDirectResponse,
  CosSupportedChainIdsResponse,
} from '@/types/message/inject/cosmos';
import { CosmosRPCError } from '@/utils/error';

import { cosmosRequestApp } from '../request';
import { toUint8Array } from '../utils';

function isCosRequestAccounts(message: BaseRequest): message is CosRequestAccounts {
  return message.method === 'cos_requestAccounts';
}

function isCosRequestAccountsSettled(message: BaseRequest): message is CosRequestAccountsSettled {
  return message.method === 'cos_requestAccountsSettled';
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

  if (isCosRequestAccountsSettled(message)) {
    const result = (await cosmosRequestApp(message)) as CosRequestAccountsSettledResponse;

    const response = result.map((item) => {
      if (item.status === 'fulfilled') {
        return {
          status: item.status,
          value: {
            ...item.value,
            publicKey: new Uint8Array(Buffer.from(item.value.publicKey, 'hex')),
          },
        };
      }
      return item;
    });

    return response;
  }

  if (isCosSignDirect(message)) {
    const { params } = message as CosSignDirect;

    const doc = params?.doc;

    const newDoc: SignDirectDoc = doc
      ? {
          ...doc,
          auth_info_bytes: doc.auth_info_bytes ? [...Array.from(toUint8Array(doc.auth_info_bytes))] : doc.auth_info_bytes,
          body_bytes: doc.body_bytes ? [...Array.from(toUint8Array(doc.body_bytes))] : doc.body_bytes,
        }
      : doc;

    const newParams: CosSignDirectParams = params ? { ...params, doc: newDoc } : params;
    const newMessage = { ...message, params: newParams };

    const result = (await cosmosRequestApp(newMessage)) as CosSignDirectResponse;

    const response: CosSignDirectResponse = {
      ...result,
      signed_doc: {
        ...result.signed_doc,
        auth_info_bytes: toUint8Array(result.signed_doc.auth_info_bytes).buffer,
        body_bytes: toUint8Array(result.signed_doc.body_bytes).buffer,
      },
    };

    return response;
  }

  if (isCosSendTransaction(message)) {
    const { params } = message as CosSendTransaction;

    const txBytes = params?.txBytes && typeof params.txBytes === 'object' ? Buffer.from(params.txBytes).toString('base64') : params.txBytes;

    const newParams = { ...params, txBytes };
    const newMessage = { ...message, params: newParams };

    return cosmosRequestApp(newMessage);
  }

  return cosmosRequestApp(message);
};

export class CosmostaionCosmos implements CosmosProvider {
  private static instance: CosmostaionCosmos;

  private accountChangedEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};

  public static getInstance(): CosmostaionCosmos {
    if (!CosmostaionCosmos.instance) {
      CosmostaionCosmos.instance = new CosmostaionCosmos();
    }
    return CosmostaionCosmos.instance;
  }

  request = wrappedCosmosRequestApp;

  on(eventName: CosmosListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'accountChanged') {
      this.accountChangedEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'cosmos') {
          eventHandler(event.detail.data.result);
        }
      };

      window.addEventListener('accountChanged', this.accountChangedEventHandler as EventListener);
    }
  }

  off(eventName: CosmosListenerType) {
    if (eventName === 'accountChanged') {
      window.removeEventListener('accountChanged', this.accountChangedEventHandler as EventListener);
    }
  }
}
