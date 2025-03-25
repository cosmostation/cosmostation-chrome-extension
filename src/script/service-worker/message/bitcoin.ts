import validate from 'bitcoin-address-validation';
import { Transaction } from 'bitcoinjs-lib';

import { Network } from '@/constants/bitcoin/common';
import { BITCOIN_METHOD_TYPE, BITCOIN_NO_POPUP_METHOD_TYPE, BITCOIN_POPUP_METHOD_TYPE } from '@/constants/bitcoin/message';
import { BITCOIN_RPC_ERROR_MESSAGE, RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { getAddress, getKeypair } from '@/libs/address';
import { sendMessage } from '@/libs/extension';
import type { AccountDetail } from '@/types/bitcoin/balance';
import type { SendRawTransaction } from '@/types/bitcoin/txs';
import type { ResponseAppMessage } from '@/types/message/content';
import type {
  BitcoinRequest,
  BitcSwitchNetwork,
  BitGetAddress,
  BitGetBalance,
  BitGetNetwork,
  BitGetPublicKeyHex,
  BitPushTx,
  BitRequestAccount,
  BitSwitchNetwork,
} from '@/types/message/inject/bitcoin';
import { BitcoinRPCError } from '@/utils/error';
import { get, post } from '@/utils/fetch';
import { refreshOriginConnectionTime } from '@/utils/origins';
import { processRequest } from '@/utils/requestApp';
import { extensionLocalStorage, extensionSessionStorage } from '@/utils/storage';

export async function bitcoinProcess(message: BitcoinRequest) {
  const { method, requestId, tabId, origin } = message;

  const bitcoinMethods = Object.values(BITCOIN_METHOD_TYPE) as string[];
  const bitcoinPopupMethods = Object.values(BITCOIN_POPUP_METHOD_TYPE) as string[];
  const bitcoinNoPopupMethods = Object.values(BITCOIN_NO_POPUP_METHOD_TYPE) as string[];

  const { currentAccount, currentAccountAllowedOrigins, currentBitcoinNetwork } = await extensionLocalStorage();
  const { currentPassword } = await extensionSessionStorage();

  const chain = currentBitcoinNetwork;

  try {
    if (!method || !bitcoinMethods.includes(method)) {
      throw new BitcoinRPCError(RPC_ERROR.METHOD_NOT_SUPPORTED, RPC_ERROR_MESSAGE[RPC_ERROR.METHOD_NOT_SUPPORTED]);
    }

    if (bitcoinPopupMethods.includes(method)) {
      if (method === 'bit_requestAccount') {
        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          void refreshOriginConnectionTime(currentAccount.id, origin);

          const keyPair = getKeypair(chain, currentAccount, currentPassword);
          const address = getAddress(chain, keyPair?.publicKey);

          const result = [address];

          sendMessage<ResponseAppMessage<BitRequestAccount>>({
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
      if (method === 'bit_switchNetwork') {
        const { params } = message;

        try {
          const network = params[0];
          const currentNetwork = chain.isTestnet ? Network.SIGNET : Network.MAINNET;
          const supportedNetworks = ['mainnet', 'signet'];

          if (!supportedNetworks.includes(network)) {
            throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'the network is invalid, supported networks: mainnet,signet', requestId);
          }

          if (network === currentNetwork) {
            const result = currentNetwork;

            sendMessage<ResponseAppMessage<BitSwitchNetwork>>({
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

            return;
          }

          void processRequest({ ...message, method: 'bitc_switchNetwork', params: [network] });
        } catch (err) {
          if (err instanceof BitcoinRPCError) {
            throw err;
          }

          throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'error', requestId);
        }
      }
      if (method === 'bitc_switchNetwork') {
        const { params } = message;

        try {
          const network = params[0];
          const currentNetwork = chain.isTestnet ? Network.SIGNET : Network.MAINNET;
          const supportedNetworks = ['mainnet', 'signet'];

          if (!supportedNetworks.includes(network)) {
            throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'the network is invalid, supported networks: mainnet,signet', requestId);
          }

          if (network === currentNetwork) {
            const result = currentNetwork;

            sendMessage<ResponseAppMessage<BitcSwitchNetwork>>({
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

            return;
          }

          void processRequest({ ...message });
        } catch (err) {
          if (err instanceof BitcoinRPCError) {
            throw err;
          }

          throw new BitcoinRPCError(RPC_ERROR.INVALID_PARAMS, `${err as string}`, requestId);
        }
      }
      if (method === 'bit_signMessage') {
        const { params } = message;

        try {
          const { type } = params;
          if (type !== 'ecdsa' && type !== 'bip322-simple') {
            throw new BitcoinRPCError(RPC_ERROR.INVALID_PARAMS, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_PARAMS], requestId);
          }

          void processRequest({ ...message });
        } catch (err) {
          if (err instanceof BitcoinRPCError) {
            throw err;
          }

          throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'error', requestId);
        }
      }

      if (method === 'bit_sendBitcoin') {
        const { params } = message;
        try {
          const { to } = params;
          if (!validate(to)) {
            throw new BitcoinRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid address', requestId);
          }

          void processRequest({ ...message });
        } catch (err) {
          if (err instanceof BitcoinRPCError) {
            throw err;
          }

          throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'error', requestId);
        }
      }

      if (method === 'bit_signPsbt') {
        try {
          void processRequest({ ...message });
        } catch (err) {
          if (err instanceof BitcoinRPCError) {
            throw err;
          }

          throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'error', requestId);
        }
      }

      if (method === 'bit_signPsbts') {
        try {
          void processRequest({ ...message });
        } catch (err) {
          if (err instanceof BitcoinRPCError) {
            throw err;
          }

          throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'error', requestId);
        }
      }
    } else if (bitcoinNoPopupMethods.includes(method)) {
      if (method === 'bit_getAddress') {
        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          const keyPair = getKeypair(chain, currentAccount, currentPassword);
          const address = getAddress(chain, keyPair?.publicKey);

          const result = address || '';

          sendMessage<ResponseAppMessage<BitGetAddress>>({
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
          const result = '';

          sendMessage<ResponseAppMessage<BitGetAddress>>({
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
      }

      if (method === 'bit_getBalance') {
        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          const keyPair = getKeypair(chain, currentAccount, currentPassword);
          const address = getAddress(chain, keyPair?.publicKey);

          const response = await get<AccountDetail>(`${chain.mempoolURL}/address/${address}`);

          const availableBalance = response.chain_stats.funded_txo_sum - response.chain_stats.spent_txo_sum - response.mempool_stats.spent_txo_sum;

          const result = availableBalance;

          sendMessage<ResponseAppMessage<BitGetBalance>>({
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
          const result = 0;

          sendMessage<ResponseAppMessage<BitGetBalance>>({
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
      }
      if (method === 'bit_getPublicKeyHex') {
        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          const keyPair = getKeypair(chain, currentAccount, currentPassword);

          const result: string = keyPair?.publicKey || '';

          sendMessage<ResponseAppMessage<BitGetPublicKeyHex>>({
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
          const result = '';

          sendMessage<ResponseAppMessage<BitGetPublicKeyHex>>({
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
      }
      if (method === 'bit_getNetwork') {
        const result = chain.isTestnet ? Network.SIGNET : Network.MAINNET;

        sendMessage<ResponseAppMessage<BitGetNetwork>>({
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
      if (method === 'bit_pushTx') {
        if (currentAccountAllowedOrigins.includes(origin) && currentPassword) {
          try {
            const { params } = message;
            const tx = params[0];

            const decodedTransaction = Transaction.fromHex(tx);

            if (!decodedTransaction) {
              throw new BitcoinRPCError(RPC_ERROR.INVALID_PARAMS, 'Invalid transaction', requestId);
            }

            const response = await post<SendRawTransaction>(chain.rpcUrls[0].url, {
              jsonrpc: '2.0',
              id: '1',
              method: 'sendrawtransaction',
              params: [tx],
            });

            const { result } = response;

            if (response.error || !result) {
              throw new BitcoinRPCError(response.error?.code || RPC_ERROR.INTERNAL, response.error?.message || 'Fail to post tx', requestId);
            }

            sendMessage<ResponseAppMessage<BitPushTx>>({
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
          } catch {
            throw new BitcoinRPCError(RPC_ERROR.INTERNAL, 'error', requestId);
          }
        } else {
          throw new BitcoinRPCError(RPC_ERROR.UNAUTHORIZED, BITCOIN_RPC_ERROR_MESSAGE[RPC_ERROR.UNAUTHORIZED], requestId);
        }
      }
    } else {
      throw new BitcoinRPCError(RPC_ERROR.INVALID_REQUEST, RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_REQUEST], requestId);
    }
  } catch (e) {
    if (e instanceof BitcoinRPCError) {
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
