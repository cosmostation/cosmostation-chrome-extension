import { PublicKey } from '@solana/web3.js';

import { RPC_ERROR, RPC_ERROR_MESSAGE, SOLANA_RPC_ERROR_MESSAGE } from '@/constants/error';
import { SOLANA_METHOD_TYPE, /* SOLANA_NO_POPUP_METHOD_TYPE, */ SOLANA_POPUP_METHOD_TYPE } from '@/constants/solana/message';
import { /* getAddress, */ getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { ResponseAppMessage } from '@/types/message/content';
import type { SolanaConnect, /* SolanaConnectResponse, SolanaDisconnect,*/ SolanaRequest } from '@/types/message/inject/solana';
import { SolanaRPCError } from '@/utils/error';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage /* setExtensionLocalStorage */ } from '@/utils/storage';

// import { aptosSignMessageSchema, aptosSignTransactionSchema } from './schema';

export async function solanaProcess(message: SolanaRequest) {
  const { method, requestId, tabId, origin } = message;

  const solanaMethods = Object.values(SOLANA_METHOD_TYPE) as string[];
  const solanaPopupMethods = Object.values(SOLANA_POPUP_METHOD_TYPE) as string[];
  // const solanaNoPopupMethods = Object.values(SOLANA_NO_POPUP_METHOD_TYPE) as string[];

  const { currentAccount, currentAccountAllowedOrigins, currentAptosNetwork /*, approvedOrigins */ } = await extensionLocalStorage();
  const { currentPassword } = await extensionSessionStorage();

  const chain = currentAptosNetwork;

  try {
    if (!method || !solanaMethods.includes(method)) {
      throw new SolanaRPCError(RPC_ERROR.UNSUPPORTED_METHOD, SOLANA_RPC_ERROR_MESSAGE[RPC_ERROR.UNSUPPORTED_METHOD]);
    }

    if (solanaPopupMethods.includes(method)) {
      if (method === 'solana_connect') {
        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          void refreshOriginConnectionTime(currentAccount.id, origin);

          const keyPair = getKeypair(chain, currentAccount, currentPassword);

          const result = { publicKey: new PublicKey(Buffer.from(keyPair.publicKey, 'hex')) };

          sendMessage<ResponseAppMessage<SolanaConnect>>({
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
    } else {
      throw new SolanaRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST]);
    }
  } catch (e) {
    if (e instanceof SolanaRPCError) {
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
