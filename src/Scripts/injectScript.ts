import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type { SignAminoDoc } from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';
import type {
  CommonRequestMessage,
  ContentScriptToWebEventMessage,
  CosmosListenerType,
  CosmosRequestMessage,
  EthereumListenerType,
  EthereumRequestMessage,
  ListenerMessage,
  ResponseMessage,
} from '~/types/message';
import type { ComProvidersResponse } from '~/types/message/common';
import type {
  CosRequestAccountResponse,
  CosSendTransactionResponse,
  CosSignAminoResponse,
  CosSignDirectParams,
  CosSignDirectResponse,
  CosSupportedChainIdsResponse,
} from '~/types/message/cosmos';
import type { EthRequestAccountsResponse } from '~/types/message/ethereum';

void (() => {
  window.cosmostation = {
    providers: {} as {
      keplr: Keplr;
      metamask: MetaMask;
    },
    handlerInfos: [],
    common: {
      request: (message: CommonRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          window.postMessage({
            isCosmostation: true,
            line: LINE_TYPE.COMMON,
            type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
            messageId,
            message,
          });
        }),
    },
    ethereum: {
      isMetaMask: false,
      on: (eventName: EthereumListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'ETHEREUM') {
            if (eventName === 'accountsChanged' && Array.isArray(event.data?.message?.result) && event.data?.message?.result.length === 0) {
              void (async () => {
                try {
                  const account = (await window.cosmostation.ethereum.request({ method: 'eth_requestAccounts', params: {} })) as EthRequestAccountsResponse;

                  eventHandler(account);
                } catch {
                  eventHandler([]);
                }
              })();
            } else {
              eventHandler(event.data?.message?.result);
            }
          }
        };

        window.addEventListener('message', handler);
        window.cosmostation.handlerInfos.push({ line: 'ETHEREUM', eventName, originHandler: eventHandler, handler });

        return handler;
      },
      addListener: (eventName: EthereumListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'ETHEREUM') {
            if (eventName === 'accountsChanged' && Array.isArray(event.data?.message?.result) && event.data?.message?.result.length === 0) {
              void (async () => {
                try {
                  const account = (await window.cosmostation.ethereum.request({ method: 'eth_requestAccounts', params: {} })) as EthRequestAccountsResponse;

                  eventHandler(account);
                } catch {
                  eventHandler([]);
                }
              })();
            } else {
              eventHandler(event.data?.message?.result);
            }
          }
        };

        window.addEventListener('message', handler);
        window.cosmostation.handlerInfos.push({ line: 'ETHEREUM', eventName, originHandler: eventHandler, handler });

        return handler;
      },
      off: (eventName: EthereumListenerType | ((event: MessageEvent<ListenerMessage>) => void), eventHandler?: (data: unknown) => void) => {
        if (eventHandler === undefined) {
          window.removeEventListener('message', eventName as (event: MessageEvent<ListenerMessage>) => void);
        } else {
          const handlerInfos = window.cosmostation.handlerInfos.filter(
            (item) => item.line === 'ETHEREUM' && item.eventName === eventName && item.originHandler === eventHandler,
          );
          const notHandlerInfos = window.cosmostation.handlerInfos.filter(
            (item) => !(item.line === 'ETHEREUM' && item.eventName === eventName && item.originHandler === eventHandler),
          );

          handlerInfos.forEach((handlerInfo) => {
            window.removeEventListener('message', handlerInfo.handler);
          });

          window.cosmostation.handlerInfos = notHandlerInfos;
        }
      },
      removeListener: (eventName: EthereumListenerType | ((event: MessageEvent<ListenerMessage>) => void), eventHandler?: (data: unknown) => void) => {
        if (eventHandler === undefined) {
          window.removeEventListener('message', eventName as (event: MessageEvent<ListenerMessage>) => void);
        } else {
          const handlerInfos = window.cosmostation.handlerInfos.filter(
            (item) => item.line === 'ETHEREUM' && item.eventName === eventName && item.originHandler === eventHandler,
          );
          const notHandlerInfos = window.cosmostation.handlerInfos.filter(
            (item) => !(item.line === 'ETHEREUM' && item.eventName === eventName && item.originHandler === eventHandler),
          );

          handlerInfos.forEach((handlerInfo) => {
            window.removeEventListener('message', handlerInfo.handler);
          });

          window.cosmostation.handlerInfos = notHandlerInfos;
        }
      },
      request: (message: EthereumRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          window.postMessage({
            isCosmostation: true,
            line: LINE_TYPE.ETHEREUM,
            type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
            messageId,
            message,
          });
        }),
      send: (method: string, params: unknown) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response);
              } else {
                res({ result: data.response.result, jsonrpc: '2.0', id: undefined });
              }
            }
          };

          window.addEventListener('message', handler);

          window.postMessage({
            isCosmostation: true,
            line: LINE_TYPE.ETHEREUM,
            type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
            messageId,
            message: {
              method,
              params,
            },
          });
        }),
      sendAsync: (request, callback) => {
        const messageId = uuidv4();

        const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
          if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
            window.removeEventListener('message', handler);

            const { data } = event;

            if (data.response?.error) {
              callback(data.response.error, { id: request.id, jsonrpc: '2.0', method: request.method, error: data.response.error });
            } else {
              callback(null, { id: request.id, jsonrpc: '2.0', method: request.method, error: data.response.error, result: data.response.result });
            }
          }
        };

        window.addEventListener('message', handler);

        window.postMessage({
          isCosmostation: true,
          line: LINE_TYPE.ETHEREUM,
          type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
          messageId,
          message: {
            method: request.method,
            params: request.params,
          },
        });
      },
      enable: () => window.cosmostation.ethereum.request({ method: 'eth_requestAccounts', params: [] }) as Promise<EthRequestAccountsResponse>,
    },
    cosmos: {
      on: (eventName: CosmosListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'COSMOS') {
            eventHandler(event.data?.message);
          }
        };

        window.addEventListener('message', handler);

        window.cosmostation.handlerInfos.push({ line: 'COSMOS', eventName, originHandler: eventHandler, handler });

        return handler;
      },
      off: (eventName: CosmosListenerType | ((event: MessageEvent<ListenerMessage>) => void), eventHandler?: (data: unknown) => void) => {
        if (eventHandler === undefined) {
          window.removeEventListener('message', eventName as (event: MessageEvent<ListenerMessage>) => void);
        } else {
          const handlerInfos = window.cosmostation.handlerInfos.filter(
            (item) => item.line === 'COSMOS' && item.eventName === eventName && item.originHandler === eventHandler,
          );
          const notHandlerInfos = window.cosmostation.handlerInfos.filter(
            (item) => !(item.line === 'COSMOS' && item.eventName === eventName && item.originHandler === eventHandler),
          );

          handlerInfos.forEach((handlerInfo) => {
            window.removeEventListener('message', handlerInfo.handler);
          });

          window.cosmostation.handlerInfos = notHandlerInfos;
        }
      },
      request: (message: CosmosRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, CosmosRequestMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else if (
                data.message.method === 'cos_requestAccount' ||
                data.message.method === 'cos_account' ||
                data.message.method === 'ten_requestAccount' ||
                data.message.method === 'ten_account'
              ) {
                const { publicKey } = data.response.result as CosRequestAccountResponse;

                res({
                  ...(data.response.result as { publicKey: string; address: string }),
                  publicKey: new Uint8Array(Buffer.from(publicKey as unknown as string, 'hex')),
                });
              } else if (data.message.method === 'cos_signDirect' || data.message.method === 'ten_signDirect') {
                const result = data.response.result as CosSignDirectResponse;

                const response: CosSignDirectResponse = {
                  ...result,
                  signed_doc: {
                    ...result.signed_doc,
                    auth_info_bytes: new Uint8Array(Buffer.from(result.signed_doc.auth_info_bytes as unknown as string, 'hex')),
                    body_bytes: new Uint8Array(Buffer.from(result.signed_doc.body_bytes as unknown as string, 'hex')),
                  },
                };

                res(response);
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          if (message.method === 'cos_signDirect' || message.method === 'ten_signDirect') {
            const { params } = message;

            const doc = params?.doc;

            const newDoc: SignDirectDoc = doc
              ? {
                  ...doc,
                  auth_info_bytes: doc.auth_info_bytes ? (Buffer.from(doc.auth_info_bytes).toString('hex') as unknown as Uint8Array) : doc.auth_info_bytes,
                  body_bytes: doc.body_bytes ? (Buffer.from(doc.body_bytes).toString('hex') as unknown as Uint8Array) : doc.body_bytes,
                }
              : doc;

            const newParams: CosSignDirectParams = params ? { ...params, doc: newDoc } : params;
            const newMessage = { ...message, params: newParams };

            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message: newMessage,
            });
          } else if (message.method === 'cos_sendTransaction') {
            const { params } = message;

            const txBytes = params?.txBytes && typeof params.txBytes === 'object' ? Buffer.from(params.txBytes).toString('base64') : params.txBytes;

            const newParams = { ...params, txBytes };
            const newMessage = { ...message, params: newParams };

            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message: newMessage,
            });
          } else {
            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message,
            });
          }
        }),
    },
    tendermint: {
      on: (eventName: CosmosListenerType, eventHandler: (data: unknown) => void) => {
        const handler = (event: MessageEvent<ListenerMessage>) => {
          if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'COSMOS') {
            eventHandler(event.data?.message);
          }
        };

        window.addEventListener('message', handler);

        return handler;
      },
      off: (handler: (event: MessageEvent<ListenerMessage>) => void) => {
        window.removeEventListener('message', handler);
      },
      request: (message: CosmosRequestMessage) =>
        new Promise((res, rej) => {
          const messageId = uuidv4();

          const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, CosmosRequestMessage>>) => {
            if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
              window.removeEventListener('message', handler);

              const { data } = event;

              if (data.response?.error) {
                rej(data.response.error);
              } else if (
                data.message.method === 'cos_requestAccount' ||
                data.message.method === 'cos_account' ||
                data.message.method === 'ten_requestAccount' ||
                data.message.method === 'ten_account'
              ) {
                const { publicKey } = data.response.result as CosRequestAccountResponse;

                res({
                  ...(data.response.result as { publicKey: string; address: string }),
                  publicKey: new Uint8Array(Buffer.from(publicKey as unknown as string, 'hex')),
                });
              } else if (data.message.method === 'cos_signDirect' || data.message.method === 'ten_signDirect') {
                const result = data.response.result as CosSignDirectResponse;

                const response: CosSignDirectResponse = {
                  ...result,
                  signed_doc: {
                    ...result.signed_doc,
                    auth_info_bytes: new Uint8Array(Buffer.from(result.signed_doc.auth_info_bytes as unknown as string, 'hex')),
                    body_bytes: new Uint8Array(Buffer.from(result.signed_doc.body_bytes as unknown as string, 'hex')),
                  },
                };

                res(response);
              } else {
                res(data.response.result);
              }
            }
          };

          window.addEventListener('message', handler);

          if (message.method === 'cos_signDirect' || message.method === 'ten_signDirect') {
            const { params } = message;

            const doc = params?.doc;

            const newDoc: SignDirectDoc = doc
              ? {
                  ...doc,
                  auth_info_bytes: doc.auth_info_bytes ? (Buffer.from(doc.auth_info_bytes).toString('hex') as unknown as Uint8Array) : doc.auth_info_bytes,
                  body_bytes: doc.body_bytes ? (Buffer.from(doc.body_bytes).toString('hex') as unknown as Uint8Array) : doc.body_bytes,
                }
              : doc;

            const newParams: CosSignDirectParams = params ? { ...params, doc: newDoc } : params;
            const newMessage = { ...message, params: newParams };

            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message: newMessage,
            });
          } else {
            window.postMessage({
              isCosmostation: true,
              line: LINE_TYPE.COSMOS,
              type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
              messageId,
              message,
            });
          }
        }),
    },
  };

  window.cosmostation.providers = {
    metamask: window.cosmostation.ethereum,
    keplr: {
      version: '0.0.0',
      mode: 'extension',
      defaultOptions: {
        sign: { disableBalanceCheck: false, preferNoSetFee: false, preferNoSetMemo: false },
      },
      enable: () =>
        new Promise((res) => {
          res();
        }),
      getKey: async (chainId) => {
        try {
          const account = (await window.cosmostation.cosmos.request({
            method: 'cos_requestAccount',
            params: { chainName: chainId },
          })) as CosRequestAccountResponse;

          return {
            isNanoLedger: account.isLedger,
            algo: account.isEthermint ? 'ethsecp256k1' : 'secp256k1',
            pubKey: account.publicKey,
            bech32Address: account.address,
            name: account.name,
            address: new Uint8Array(),
          };
        } catch (e) {
          throw new Error((e as { message?: string }).message || 'Unknown Error');
        }
      },
      experimentalSuggestChain: async (chainInfo) => {
        try {
          const supportedChainNames = (await window.cosmostation.cosmos.request({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;
          if (![...supportedChainNames.official, ...supportedChainNames.unofficial].includes(chainInfo.chainId)) {
            await window.cosmostation.cosmos.request({
              method: 'cos_addChain',
              params: {
                chainId: chainInfo.chainId,
                addressPrefix: chainInfo.bech32Config.bech32PrefixAccAddr,
                baseDenom: chainInfo.currencies[0].coinMinimalDenom,
                chainName: chainInfo.chainName || chainInfo.chainId,
                displayDenom: chainInfo.currencies[0].coinDenom,
                decimals: chainInfo.currencies[0].coinDecimals,
                restURL: chainInfo.rest,
                coinType: String(chainInfo.bip44.coinType),
                gasRate: chainInfo.gasPriceStep
                  ? {
                      tiny: String(chainInfo.gasPriceStep.low),
                      low: String(chainInfo.gasPriceStep.average),
                      average: String(chainInfo.gasPriceStep.high),
                    }
                  : undefined,
              },
            });
          }
        } catch (e) {
          throw new Error((e as { message?: string }).message || 'Unknown Error');
        }
      },
      signAmino: async (chainId, _, signDoc) => {
        try {
          const response = (await window.cosmostation.cosmos.request({
            method: 'cos_signAmino',
            params: {
              chainName: chainId,
              isEditFee: !window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetFee,
              isEditMemo: !window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetMemo,
              doc: signDoc as unknown as SignAminoDoc,
            },
          })) as CosSignAminoResponse;

          return { signed: response.signed_doc, signature: { pub_key: response.pub_key, signature: response.signature } };
        } catch (e) {
          throw new Error((e as { message?: string }).message || 'Unknown Error');
        }
      },
      signDirect: async (chainId, _, signDoc) => {
        const response = (await window.cosmostation.cosmos.request({
          method: 'cos_signDirect',
          params: {
            chainName: chainId,
            doc: {
              account_number: String(signDoc.accountNumber),
              auth_info_bytes: signDoc.authInfoBytes!,
              body_bytes: signDoc.bodyBytes!,
              chain_id: signDoc.chainId!,
            },
          },
        })) as CosSignDirectResponse;
        return {
          signed: {
            accountNumber: response.signed_doc.account_number as unknown as Long,
            chainId: response.signed_doc.chain_id,
            authInfoBytes: response.signed_doc.auth_info_bytes,
            bodyBytes: response.signed_doc.body_bytes,
          },
          signature: { pub_key: response.pub_key, signature: response.signature },
        };
      },
      sendTx: async (chainId, tx, mode) => {
        try {
          const txMode = (() => {
            if (mode === 'block') return 1;
            if (mode === 'sync') return 2;
            if (mode === 'async') return 3;
            return 0;
          })();

          const response = (await window.cosmostation.cosmos.request({
            method: 'cos_sendTransaction',
            params: {
              chainName: chainId,
              mode: txMode,
              txBytes: Buffer.from(tx).toString('base64'),
            },
          })) as CosSendTransactionResponse;

          return Buffer.from(response.tx_response.txhash, 'hex');
        } catch (e) {
          throw new Error((e as { message?: string }).message || 'Unknown Error');
        }
      },
      getOfflineSigner: (chainId) => ({
        signAmino: async (signerAddress, signDoc) => window.cosmostation.providers.keplr.signAmino(chainId, signerAddress, signDoc),
        signDirect: async (signerAddress, signDoc) => window.cosmostation.providers.keplr.signDirect(chainId, signerAddress, signDoc),
        getAccounts: async () => {
          const response = await window.cosmostation.providers.keplr.getKey(chainId);

          return [{ address: response.bech32Address, pubkey: response.pubKey, algo: response.algo as 'secp256k1' }];
        },
      }),
      getOfflineSignerOnlyAmino: (chainId) => ({
        signAmino: async (signerAddress, signDoc) => window.cosmostation.providers.keplr.signAmino(chainId, signerAddress, signDoc),
        getAccounts: async () => {
          const response = await window.cosmostation.providers.keplr.getKey(chainId);

          return [{ address: response.bech32Address, pubkey: response.pubKey, algo: response.algo as 'secp256k1' }];
        },
      }),
      getOfflineSignerAuto: async (chainId) => {
        const account = (await window.cosmostation.cosmos.request({
          method: 'cos_requestAccount',
          params: { chainName: chainId },
        })) as CosRequestAccountResponse;

        if (account.isLedger) {
          return window.cosmostation.providers.keplr.getOfflineSigner(chainId);
        }
        return window.cosmostation.providers.keplr.getOfflineSignerOnlyAmino(chainId);
      },
    },
  };

  void (async () => {
    const currentChainId = (await window.cosmostation.ethereum.request({ method: 'eth_chainId', params: [] })) as string;
    window.cosmostation.ethereum.chainId = currentChainId;
    window.cosmostation.ethereum.networkVersion = `${parseInt(currentChainId, 16)}`;

    window.cosmostation.ethereum.on('chainChanged', (chainId) => {
      window.cosmostation.ethereum.chainId = chainId as string;
      window.cosmostation.ethereum.networkVersion = `${parseInt(chainId as string, 16)}`;
    });

    const providers = (await window.cosmostation.common.request({ method: 'com_providers' })) as ComProvidersResponse;

    if (providers.keplr && !window.keplr) {
      window.keplr = window.cosmostation.providers.keplr;

      window.getOfflineSigner = window.cosmostation.providers.keplr.getOfflineSigner;
      window.getOfflineSignerOnlyAmino = window.cosmostation.providers.keplr.getOfflineSignerOnlyAmino;
      window.getOfflineSignerAuto = window.cosmostation.providers.keplr.getOfflineSignerAuto;

      const keplrEvent = new CustomEvent('keplr_keystorechange', { cancelable: true });

      const handler = (event: MessageEvent<ListenerMessage>) => {
        if (event.data?.isCosmostation && event.data?.type === 'accountChanged' && event.data?.line === 'COSMOS') {
          window.dispatchEvent(keplrEvent);
        }
      };

      window.addEventListener('message', handler);
    }

    if (providers.metamask && !window.ethereum?.isMetaMask) {
      window.cosmostation.ethereum.isMetaMask = true;
      window.ethereum = window.cosmostation.providers.metamask;
    }
  })();
})();
