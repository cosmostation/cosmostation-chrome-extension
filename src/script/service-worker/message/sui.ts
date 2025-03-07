import { ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE, SUI_RPC_ERROR_MESSAGE } from '@/constants/error';
import { SUI_METHOD_TYPE, SUI_NO_POPUP_METHOD_TYPE, SUI_POPUP_METHOD_TYPE } from '@/constants/sui/message';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type {
  SuiRequest,
  SuiRequestAccount,
  SuiRequestAccountResponse,
  SuiRequestChain,
  SuiRequestConnect,
  SuiRequestConnectResponse,
  SuiRequestDisconnect,
  SuiRequestGetPermission,
  SuiSignMessage,
} from '@/types/message/inject/sui';
import type { SuiRpc } from '@/types/sui/api';
import { SuiRPCError } from '@/utils/error';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage, setExtensionLocalStorage } from '@/utils/storage';
import { isEqualsIgnoringCase } from '@/utils/string';
import { requestRPC as suiRequestRPC } from '@/utils/sui/rpc';

import { suiConnectSchema, suiSignMessageSchema } from './schema';

export async function suiProcess(message: SuiRequest) {
  const { method, requestId, tabId, origin } = message;

  const { suiChains } = await getChains();

  const suiChain = suiChains[0];

  const suiMethods = Object.values(SUI_METHOD_TYPE) as string[];
  const suiPopupMethods = Object.values(SUI_POPUP_METHOD_TYPE) as string[];
  const suiNoPopupMethods = Object.values(SUI_NO_POPUP_METHOD_TYPE) as string[];

  const { currentAccountAllowedOrigins, currentAccount, currentSuiNetwork, approvedOrigins, approvedSuiPermissions } = await extensionLocalStorage();

  const { currentPassword } = await extensionSessionStorage();

  const currentAccountSuiPermissions =
    approvedSuiPermissions
      ?.filter((permission) => permission.accountId === currentAccount.id && permission.origin === origin)
      .map((permission) => permission.permission) || [];

  try {
    if (!message?.method || !suiMethods.includes(message.method)) {
      throw new SuiRPCError(RPC_ERROR.UNSUPPORTED_METHOD, ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message.requestId);
    }

    if (suiPopupMethods.includes(method)) {
      if (method === 'sui_connect') {
        const { params } = message;

        try {
          const schema = suiConnectSchema();

          const validatedParams = (await schema.validateAsync(params)) as SuiRequestConnect['params'];

          if (currentAccountAllowedOrigins.includes(origin) && validatedParams.every((item) => currentAccountSuiPermissions.includes(item))) {
            const result: SuiRequestConnectResponse = null;

            await sendMessage<ResponseAppMessage<SuiRequestConnect>>({
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
          if (e instanceof SuiRPCError) {
            throw e;
          }

          throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'sui_getAccount') {
        try {
          if (currentAccountAllowedOrigins.includes(origin) && currentAccountSuiPermissions.includes('viewAccount')) {
            if (currentPassword) {
              const keyPair = getKeypair(suiChain, currentAccount, currentPassword);
              const address = getAddress(suiChain, keyPair?.publicKey);

              const publicKey = `0x${keyPair?.publicKey || ''}`;

              const result: SuiRequestAccountResponse = {
                address,
                publicKey,
              };

              await sendMessage<ResponseAppMessage<SuiRequestAccount>>({
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
            throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
          }
        } catch (e) {
          if (e instanceof SuiRPCError) {
            throw e;
          }

          throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'sui_signMessage' || method === 'sui_signPersonalMessage') {
        const { params } = message;

        try {
          if (
            currentAccountAllowedOrigins.includes(origin) &&
            currentAccountSuiPermissions.includes('viewAccount') &&
            currentAccountSuiPermissions.includes('suggestTransactions') &&
            currentPassword
          ) {
            const keyPair = getKeypair(suiChain, currentAccount, currentPassword);
            const address = getAddress(suiChain, keyPair?.publicKey);

            if (!isEqualsIgnoringCase(address, params.accountAddress)) {
              throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', requestId);
            }

            const schema = suiSignMessageSchema();

            const validatedParams = (await schema.validateAsync(params)) as SuiSignMessage['params'];

            void processRequest({ ...message, method: method, params: validatedParams });
          } else {
            throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
          }
        } catch (e) {
          if (e instanceof SuiRPCError) {
            throw e;
          }

          throw new SuiRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'sui_signTransactionBlock' || method === 'sui_signTransaction') {
        if (
          currentAccountAllowedOrigins.includes(origin) &&
          currentAccountSuiPermissions.includes('viewAccount') &&
          currentAccountSuiPermissions.includes('suggestTransactions')
        ) {
          void processRequest({ ...message, method: method });
        } else {
          throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
        }
      }

      if (method === 'sui_signAndExecuteTransactionBlock' || method === 'sui_signAndExecuteTransaction') {
        if (
          currentAccountAllowedOrigins.includes(origin) &&
          currentAccountSuiPermissions.includes('viewAccount') &&
          currentAccountSuiPermissions.includes('suggestTransactions')
        ) {
          void processRequest({ ...message, method: method });
        } else {
          throw new SuiRPCError(RPC_ERROR.UNAUTHORIZED, SUI_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
        }
      }
    } else if (suiNoPopupMethods.includes(method)) {
      if (method === 'sui_getPermissions') {
        sendMessage<ResponseAppMessage<SuiRequestGetPermission>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: currentAccountSuiPermissions,
          },
        });
      } else if (method === 'sui_disconnect') {
        const newAllowedOrigins = approvedOrigins.filter((item) => !(item.accountId === currentAccount.id && item.origin === origin));
        await setExtensionLocalStorage('approvedOrigins', newAllowedOrigins);

        const newSuiPermissions = approvedSuiPermissions.filter((permission) => !(permission.accountId === currentAccount.id && permission.origin === origin));
        await setExtensionLocalStorage('approvedSuiPermissions', newSuiPermissions);

        const result = null;

        sendMessage<ResponseAppMessage<SuiRequestDisconnect>>({
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
      } else if (method === 'sui_getChain') {
        const getChainResult = currentSuiNetwork.isTestnet ? 'testnet' : currentSuiNetwork.isDevnet ? 'devnet' : 'mainnet';

        await sendMessage<ResponseAppMessage<SuiRequestChain>>({
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

        const response = await suiRequestRPC<SuiRpc<unknown>>(method, params, requestId);

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
      throw new SuiRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST], message.requestId);
    }
  } catch (e) {
    if (e instanceof SuiRPCError) {
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
