import { APTOS_METHOD_TYPE, APTOS_NO_POPUP_METHOD_TYPE, APTOS_POPUP_METHOD_TYPE } from '@/constants/aptos/message';
import { APTOS_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type {
  AptosAccount,
  AptosDisconnect,
  AptosIsConnected,
  AptosNetwork,
  AptosRequest,
  AptosSignMessage,
  AptosSignTransaction,
} from '@/types/message/inject/aptos';
import { AptosRPCError } from '@/utils/error';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage, setExtensionLocalStorage } from '@/utils/storage';

import { aptosSignMessageSchema, aptosSignTransactionSchema } from './schema';

export async function aptosProcess(message: AptosRequest) {
  const { method, requestId, tabId, origin } = message;

  const aptosMethods = Object.values(APTOS_METHOD_TYPE) as string[];
  const aptosPopupMethods = Object.values(APTOS_POPUP_METHOD_TYPE) as string[];
  const aptosNoPopupMethods = Object.values(APTOS_NO_POPUP_METHOD_TYPE) as string[];

  const { currentAccount, currentAccountAllowedOrigins, currentAptosNetwork, approvedOrigins } = await extensionLocalStorage();
  const { currentPassword } = await extensionSessionStorage();

  const chain = currentAptosNetwork;

  try {
    if (!method || !aptosMethods.includes(method)) {
      throw new AptosRPCError(RPC_ERROR.UNSUPPORTED_METHOD, APTOS_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD]);
    }

    if (aptosPopupMethods.includes(method)) {
      if (method === 'aptos_connect' || method === 'aptos_account') {
        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          void refreshOriginConnectionTime(currentAccount.id, origin);

          const keyPair = getKeypair(chain, currentAccount, currentPassword);
          const address = getAddress(chain, keyPair?.publicKey);

          const result = { address, publicKey: `0x${keyPair?.publicKey || ''}` };

          sendMessage<ResponseAppMessage<AptosAccount>>({
            target: 'CONTENT',
            method: 'responseApp',
            origin,
            requestId,
            tabId,
            params: {
              id: requestId,
              result,
            },
          });
        } else {
          void processRequest({ ...message });
        }
      }

      if (method === 'aptos_signTransaction') {
        const { params } = message;

        try {
          const schema = aptosSignTransactionSchema();

          const validatedParams = (await schema.validateAsync(params)) as AptosSignTransaction['params'];

          void processRequest({
            ...message,

            params: validatedParams as AptosSignTransaction['params'],
          });
        } catch (e) {
          if (e instanceof AptosRPCError) {
            throw e;
          }

          throw new AptosRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`);
        }
      }

      if (method === 'aptos_signMessage') {
        const { params } = message;

        try {
          const schema = aptosSignMessageSchema();

          const validatedParams = (await schema.validateAsync(params)) as AptosSignMessage['params'];

          void processRequest({ ...message, params: validatedParams as AptosSignMessage['params'] });
        } catch (e) {
          if (e instanceof AptosRPCError) {
            throw e;
          }

          throw new AptosRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`);
        }
      }
    } else if (aptosNoPopupMethods.includes(method)) {
      if (method === 'aptos_isConnected') {
        const result = !!currentAccountAllowedOrigins.includes(origin);

        sendMessage<ResponseAppMessage<AptosIsConnected>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result,
          },
        });
      }

      if (method === 'aptos_disconnect') {
        const newAllowedOrigins = approvedOrigins.filter((item) => !(item.accountId === currentAccount.id && item.origin === origin));

        await setExtensionLocalStorage('approvedOrigins', newAllowedOrigins);

        const result = null;

        sendMessage<ResponseAppMessage<AptosDisconnect>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result,
          },
        });
      }

      if (method === 'aptos_network') {
        const result = currentAptosNetwork.isTestnet ? 'testnet' : currentAptosNetwork.isDevnet ? 'devnet' : 'mainnet';

        sendMessage<ResponseAppMessage<AptosNetwork>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result,
          },
        });
      }
    } else {
      throw new AptosRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
    }
  } catch (e) {
    if (e instanceof AptosRPCError) {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin,
        requestId,
        tabId,
        params: {
          id: requestId,
          error: e.rpcMessage?.error,
        },
      });
      return;
    }

    sendMessage({
      target: 'CONTENT',
      method: 'responseApp',
      origin,
      requestId,
      tabId,
      params: {
        id: requestId,
        error: {
          code: RPC_ERROR.INTERNAL,
          message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL]}`,
        },
      },
    });
  }
}
