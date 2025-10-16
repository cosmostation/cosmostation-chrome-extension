import { ETHEREUM_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { RESPONSE_MESSAGE, RESPONSE_STATUS } from '@/constants/gno';
import { GNO_METHOD_TYPE, GNO_NO_POPUP_METHOD_TYPE, GNO_POPUP_METHOD_TYPE } from '@/constants/gno/message';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
// import { getAddress, getKeypair } from '@/libs/address';
// import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { GnoConnect, GnoConnectResponse, GnoGetAccountResponse, GnoRequest, GnoSwitchNetwork } from '@/types/message/inject/gno';
import { GnoRPCError } from '@/utils/error';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage } from '@/utils/storage';

import { gnoSwitchNetworkParamsSchema } from './schema';
// import { isEqualsIgnoringCase } from '@/utils/string';

export async function gnoProcess(message: GnoRequest) {
  const { method, requestId, tabId, origin } = message;

  const { gnoChains } = await getChains();

  const gnoChain = gnoChains[0];

  const gnoMethods = Object.values(GNO_METHOD_TYPE) as string[];
  const gnoPopupMethods = Object.values(GNO_POPUP_METHOD_TYPE) as string[];
  const gnoNoPopupMethods = Object.values(GNO_NO_POPUP_METHOD_TYPE) as string[];

  const { currentAccountAllowedOrigins, currentAccount, currentGnoNetwork } = await extensionLocalStorage();

  const { currentPassword } = await extensionSessionStorage();

  try {
    if (!message?.method || !gnoMethods.includes(message.method)) {
      throw new GnoRPCError(RPC_ERROR.UNSUPPORTED_METHOD, ETHEREUM_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message.requestId);
    }

    if (gnoPopupMethods.includes(method)) {
      if (method === 'gno_connect') {
        try {
          if (currentAccountAllowedOrigins.includes(origin)) {
            void refreshOriginConnectionTime(currentAccount.id, origin);

            const result: GnoConnectResponse = {
              code: 0,
              status: RESPONSE_STATUS.SUCCESS,
              message: RESPONSE_MESSAGE.CONNECTION_SUCCESS,
              data: {},
            };

            await sendMessage<ResponseAppMessage<GnoConnect>>({
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
            await processRequest({ ...message, method: method, params: undefined });
          }
        } catch (e) {
          if (e instanceof GnoRPCError) {
            throw e;
          }

          throw new GnoRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'gno_getAccount') {
        try {
          if (gnoChain && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            void refreshOriginConnectionTime(currentAccount.id, origin);

            const keyPair = getKeypair(gnoChain, currentAccount, currentPassword);
            const address = getAddress(gnoChain, keyPair?.publicKey);

            const result: GnoGetAccountResponse = {
              code: 0,
              status: RESPONSE_STATUS.SUCCESS,
              message: '',
              data: {
                address,
                publicKey: keyPair?.publicKey ? Buffer.from(keyPair.publicKey, 'hex').toString('base64') : null,
              },
            };

            await sendMessage<ResponseAppMessage<GnoConnect>>({
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
            await processRequest({ ...message, method: method, params: undefined });
          }
        } catch (e) {
          if (e instanceof GnoRPCError) {
            throw e;
          }

          throw new GnoRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'gno_signAndSendTransaction' || method === 'gno_signTransaction') {
        const { params } = message;
        try {
          await processRequest({ ...message, method: method, params });
        } catch (e) {
          if (e instanceof GnoRPCError) {
            throw e;
          }

          throw new GnoRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'gno_signMessage') {
        const { params } = message;
        try {
          await processRequest({ ...message, method: method, params });
        } catch (e) {
          if (e instanceof GnoRPCError) {
            throw e;
          }

          throw new GnoRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }

      if (method === 'gno_switchNetwork') {
        const { gnoChains } = await getChains();
        const { params } = message;

        const chainIds = gnoChains.map((chain) => chain.chainId);
        try {
          const schema = gnoSwitchNetworkParamsSchema(chainIds);

          const validatedParams = (await schema.validateAsync(params)) as GnoSwitchNetwork['params'];

          if (validatedParams[0] === currentGnoNetwork.chainId) {
            sendMessage<ResponseAppMessage<GnoSwitchNetwork>>({
              target: 'CONTENT',
              method: 'responseApp',
              origin,
              requestId,
              tabId,
              params: {
                id: requestId,
                result: {
                  code: 0,
                  status: RESPONSE_STATUS.SUCCESS,
                  message: '',
                  data: { chainId: currentGnoNetwork.chainId },
                },
              },
            });

            return;
          }

          await processRequest({ ...message, method: method, params: validatedParams });
        } catch (e) {
          throw new GnoRPCError(RPC_ERROR.INVALID_PARAMS, `${e as string}`, requestId);
        }
      }
    } else if (gnoNoPopupMethods.includes(method)) {
      // TODO: Implement gnoNoPopupMethods

      if (method === 'gno_getNetwork') {
        sendMessage<ResponseAppMessage<GnoSwitchNetwork>>({
          target: 'CONTENT',
          method: 'responseApp',
          origin,
          requestId,
          tabId,
          params: {
            id: requestId,
            result: {
              code: 0,
              status: RESPONSE_STATUS.SUCCESS,
              message: '',
              data: { chainId: currentGnoNetwork.chainId },
            },
          },
        });

        return;
      }
    } else {
      throw new GnoRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST], message.requestId);
    }
  } catch (e) {
    if (e instanceof GnoRPCError) {
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
