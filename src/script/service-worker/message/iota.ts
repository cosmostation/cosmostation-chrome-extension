import { IOTA_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { IOTA_METHOD_TYPE, IOTA_NO_POPUP_METHOD_TYPE, IOTA_POPUP_METHOD_TYPE } from '@/constants/iota/message';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { IotaRpc } from '@/types/iota/api';
import type { ResponseAppMessage } from '@/types/message/content';
import type {
  IotaRequest,
  IotaRequestAccount,
  IotaRequestAccountResponse,
  IotaRequestChain,
  IotaRequestConnect,
  IotaRequestConnectResponse,
  IotaRequestDisconnect,
  IotaRequestGetPermission,
  IotaSignPersonalMessage,
} from '@/types/message/inject/iota';
import { IotaRPCError } from '@/utils/error';
import { requestRPC as iotaRequestRPC } from '@/utils/iota/rpc';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage, setExtensionLocalStorage } from '@/utils/storage';
import { isEqualsIgnoringCase } from '@/utils/string';

import { iotaConnectSchema, iotaSignMessageSchema } from './schema';

export async function iotaProcess(message: IotaRequest) {
  const { method, requestId, tabId, origin } = message;

  const { iotaChains } = await getChains();

  const iotaChain = iotaChains[0];

  const iotaMethods = Object.values(IOTA_METHOD_TYPE) as string[];
  const iotaPopupMethods = Object.values(IOTA_POPUP_METHOD_TYPE) as string[];
  const iotaNoPopupMethods = Object.values(IOTA_NO_POPUP_METHOD_TYPE) as string[];

  const { currentAccountAllowedOrigins, currentAccount, currentIotaNetwork, approvedOrigins, approvedIotaPermissions } = await extensionLocalStorage();

  const { currentPassword } = await extensionSessionStorage();

  const currentAccountIotaPermissions =
    approvedIotaPermissions
      ?.filter((permission) => permission.accountId === currentAccount.id && permission.origin === origin)
      .map((permission) => permission.permission) || [];

  try {
    if (!message?.method || !iotaMethods.includes(message.method)) {
      throw new IotaRPCError(RPC_ERROR.UNSUPPORTED_METHOD, IOTA_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message.requestId);
    }

    if (iotaPopupMethods.includes(method)) {
      if (method === 'iota_connect') {
        const { params } = message;

        try {
          const schema = iotaConnectSchema();

          const validatedParams = (await schema.validateAsync(params)) as IotaRequestConnect['params'];

          if (currentAccountAllowedOrigins.includes(origin) && validatedParams.every((item) => currentAccountIotaPermissions.includes(item))) {
            void refreshOriginConnectionTime(currentAccount.id, origin);

            const result: IotaRequestConnectResponse = null;

            await sendMessage<ResponseAppMessage<IotaRequestConnect>>({
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
            await processRequest({ ...message, method: method, params: Array.from(new Set([...validatedParams])) });
          }
        } catch (e) {
          if (e instanceof IotaRPCError) {
            throw e;
          }

          throw new IotaRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'iota_getAccount') {
        try {
          if (currentAccountAllowedOrigins.includes(origin) && currentAccountIotaPermissions.includes('viewAccount')) {
            if (currentPassword) {
              void refreshOriginConnectionTime(currentAccount.id, origin);

              const keyPair = getKeypair(iotaChain, currentAccount, currentPassword);
              const address = getAddress(iotaChain, keyPair?.publicKey);

              const publicKey = `0x${keyPair?.publicKey || ''}`;

              const result: IotaRequestAccountResponse = {
                address,
                publicKey,
              };

              await sendMessage<ResponseAppMessage<IotaRequestAccount>>({
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
              await processRequest({ ...message });
            }
          } else {
            throw new IotaRPCError(RPC_ERROR.UNAUTHORIZED, IOTA_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
          }
        } catch (e) {
          if (e instanceof IotaRPCError) {
            throw e;
          }

          throw new IotaRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'iota_signPersonalMessage') {
        const { params } = message;

        try {
          if (
            currentAccountAllowedOrigins.includes(origin) &&
            currentAccountIotaPermissions.includes('viewAccount') &&
            currentAccountIotaPermissions.includes('suggestTransactions') &&
            currentPassword
          ) {
            const keyPair = getKeypair(iotaChain, currentAccount, currentPassword);
            const address = getAddress(iotaChain, keyPair?.publicKey);

            if (!isEqualsIgnoringCase(address, params.accountAddress)) {
              throw new IotaRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', requestId);
            }

            const schema = iotaSignMessageSchema();

            const validatedParams = (await schema.validateAsync(params)) as IotaSignPersonalMessage['params'];

            void processRequest({ ...message, method: method, params: validatedParams });
          } else {
            throw new IotaRPCError(RPC_ERROR.UNAUTHORIZED, IOTA_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
          }
        } catch (e) {
          if (e instanceof IotaRPCError) {
            throw e;
          }

          throw new IotaRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'iota_signTransaction') {
        if (
          currentAccountAllowedOrigins.includes(origin) &&
          currentAccountIotaPermissions.includes('viewAccount') &&
          currentAccountIotaPermissions.includes('suggestTransactions')
        ) {
          void processRequest({ ...message, method: method });
        } else {
          throw new IotaRPCError(RPC_ERROR.UNAUTHORIZED, IOTA_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
        }
      }

      if (method === 'iota_signAndExecuteTransaction') {
        if (
          currentAccountAllowedOrigins.includes(origin) &&
          currentAccountIotaPermissions.includes('viewAccount') &&
          currentAccountIotaPermissions.includes('suggestTransactions')
        ) {
          void processRequest({ ...message, method: method });
        } else {
          throw new IotaRPCError(RPC_ERROR.UNAUTHORIZED, IOTA_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
        }
      }
    } else if (iotaNoPopupMethods.includes(method)) {
      if (method === 'iota_getPermissions') {
        sendMessage<ResponseAppMessage<IotaRequestGetPermission>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: currentAccountIotaPermissions,
          },
        });
      } else if (method === 'iota_disconnect') {
        const newAllowedOrigins = approvedOrigins.filter((item) => !(item.accountId === currentAccount.id && item.origin === origin));
        await setExtensionLocalStorage('approvedOrigins', newAllowedOrigins);

        const newIotaPermissions = approvedIotaPermissions.filter(
          (permission) => !(permission.accountId === currentAccount.id && permission.origin === origin),
        );
        await setExtensionLocalStorage('approvedIotaPermissions', newIotaPermissions);

        const result = null;

        sendMessage<ResponseAppMessage<IotaRequestDisconnect>>({
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
      } else if (method === 'iota_getChain') {
        const getChainResult = currentIotaNetwork.isTestnet ? 'testnet' : currentIotaNetwork.isDevnet ? 'devnet' : 'mainnet';

        await sendMessage<ResponseAppMessage<IotaRequestChain>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: getChainResult,
          },
        });
      } else {
        const { params } = message;

        const response = await iotaRequestRPC<IotaRpc<unknown>>(method, params, requestId);

        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: response.result,
          },
        });
      }
    } else {
      throw new IotaRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST], message.requestId);
    }
  } catch (e) {
    if (e instanceof IotaRPCError) {
      sendMessage({
        target: 'CONTENT',
        method: 'responseApp',
        origin,
        requestId,
        tabId,
        params: {
          id: requestId,
          error: e.rpcMessage.error,
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
