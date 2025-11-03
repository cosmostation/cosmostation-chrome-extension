import { GNO_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { EAccountStatus, RESPONSE_MESSAGE, RESPONSE_STATUS } from '@/constants/gno';
import { GNO_METHOD_TYPE, GNO_NO_POPUP_METHOD_TYPE, GNO_POPUP_METHOD_TYPE } from '@/constants/gno/message';
import { getAddress, getKeypair } from '@/libs/address';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import {
  type GnoConnect,
  type GnoConnectResponse,
  type GnoGetAccountResponse,
  type GnoGetNetwork,
  type GnoRequest,
  type GnoSwitchNetwork,
} from '@/types/message/inject/gno';
import { GnoRPCError } from '@/utils/error';
import { fetchGnoAccount } from '@/utils/gno/fetch/account';
import { fetchGnoBalance } from '@/utils/gno/fetch/balance';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { processRequest } from '@/utils/requestApp';
import { extensionSessionStorage } from '@/utils/storage';
import { getGnoDefaultStorageData } from '@/utils/storage/localStorage';

import { gnoSwitchNetworkParamsSchema } from './schema';

export async function gnoProcess(message: GnoRequest) {
  const { method, requestId, tabId, origin } = message;

  const gnoMethods = Object.values(GNO_METHOD_TYPE) as string[];
  const gnoPopupMethods = Object.values(GNO_POPUP_METHOD_TYPE) as string[];
  const gnoNoPopupMethods = Object.values(GNO_NO_POPUP_METHOD_TYPE) as string[];

  const { currentAccountAllowedOrigins, currentAccount, currentGnoNetwork } = await getGnoDefaultStorageData();

  const { currentPassword } = await extensionSessionStorage();

  try {
    if (!currentAccount) {
      throw new GnoRPCError(RPC_ERROR.INTERNAL, RPC_ERROR_MESSAGE[RPC_ERROR.INTERNAL], message.requestId);
    }

    if (!message?.method || !gnoMethods.includes(message.method)) {
      throw new GnoRPCError(RPC_ERROR.UNSUPPORTED_METHOD, GNO_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD], message.requestId);
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
          if (currentGnoNetwork && currentAccountAllowedOrigins.includes(origin) && currentPassword) {
            void refreshOriginConnectionTime(currentAccount.id, origin);

            const keyPair = getKeypair(currentGnoNetwork, currentAccount, currentPassword);
            const address = getAddress(currentGnoNetwork, keyPair?.publicKey);

            const rpcURLs = currentGnoNetwork.rpcUrls.map((item) => item.url) || [];

            const account = await fetchGnoAccount(address, rpcURLs);

            const balance = await fetchGnoBalance(address, rpcURLs);

            if (!account) {
              throw new GnoRPCError(RPC_ERROR.INTERNAL, 'Fail to fetch account', requestId);
            }

            const result: GnoGetAccountResponse = {
              code: 0,
              status: RESPONSE_STATUS.SUCCESS,
              message: 'Get Account Information.',
              data: {
                address,
                coins: `${balance}${currentGnoNetwork.mainAssetDenom || ''}`,
                chainId: currentGnoNetwork.id,
                status: EAccountStatus.ACTIVE,
                publicKey: account.publicKey || null,
                accountNumber: account.account_number || '0',
                sequence: account.sequence || '0',
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
      if (method === 'gno_getNetwork') {
        sendMessage<ResponseAppMessage<GnoGetNetwork>>({
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
              data: {
                chainId: currentGnoNetwork.chainId,
                networkName: currentGnoNetwork.name,
                addressPrefix: currentGnoNetwork.accountPrefix,
                rpcUrl: currentGnoNetwork?.rpcUrls[0]?.url || '',
                indexerUrl: '',
              },
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
