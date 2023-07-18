import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type { SignAminoDoc } from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';
import type { ContentScriptToWebEventMessage, CosmosListenerType, CosmosRequestMessage, ListenerMessage, ResponseMessage } from '~/types/message';
import type {
  CosRequestAccountResponse,
  CosSendTransactionResponse,
  CosSignAminoResponse,
  CosSignDirectParams,
  CosSignDirectResponse,
  CosSignMessageResponse,
  CosSupportedChainIdsResponse,
  CosVerifyMessageResponse,
} from '~/types/message/cosmos';

export const request = (message: CosmosRequestMessage) =>
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
            publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')),
          });
        } else if (data.message.method === 'cos_signDirect' || data.message.method === 'ten_signDirect') {
          const result = data.response.result as CosSignDirectResponse;

          const response: CosSignDirectResponse = {
            ...result,
            signed_doc: {
              ...result.signed_doc,
              auth_info_bytes: new Uint8Array(result.signed_doc.auth_info_bytes),
              body_bytes: new Uint8Array(result.signed_doc.body_bytes),
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
            auth_info_bytes: doc.auth_info_bytes ? [...Array.from(new Uint8Array(doc.auth_info_bytes))] : doc.auth_info_bytes,
            body_bytes: doc.body_bytes ? [...Array.from(new Uint8Array(doc.body_bytes))] : doc.body_bytes,
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
  });

export const on = (eventName: CosmosListenerType, eventHandler: (data: unknown) => void) => {
  const handler = (event: MessageEvent<ListenerMessage>) => {
    if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'COSMOS') {
      eventHandler(event.data?.message);
    }
  };

  window.addEventListener('message', handler);

  window.cosmostation.handlerInfos.push({ line: 'COSMOS', eventName, originHandler: eventHandler, handler });

  return handler;
};

const off = (eventName: CosmosListenerType | ((event: MessageEvent<ListenerMessage>) => void), eventHandler?: (data: unknown) => void) => {
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
};

export const cosmos: Cosmos = {
  on,
  off,
  request,
};

// keplr provider start

const enable = () =>
  new Promise<void>((res) => {
    res();
  });

const getKey: Keplr['getKey'] = async (chainId) => {
  try {
    const account = (await request({
      method: 'cos_requestAccount',
      params: { chainName: chainId },
    })) as CosRequestAccountResponse;

    return {
      isNanoLedger: account.isLedger,
      algo: account.isEthermint ? 'ethsecp256k1' : 'secp256k1',
      pubKey: new Uint8Array(Buffer.from(account.publicKey, 'hex')),
      bech32Address: account.address,
      name: account.name,
      address: new Uint8Array(),
    };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const experimentalSuggestChain: Keplr['experimentalSuggestChain'] = async (chainInfo) => {
  try {
    const supportedChainNames = (await request({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;
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
};

const signAmino: Keplr['signAmino'] = async (chainId, _, signDoc) => {
  try {
    const response = (await request({
      method: 'cos_signAmino',
      params: {
        chainName: chainId,
        isEditFee: !window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetFee,
        isEditMemo: !window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetMemo,
        isCheckBalance: !window.cosmostation.providers.keplr.defaultOptions.sign?.disableBalanceCheck,
        doc: signDoc as unknown as SignAminoDoc,
      },
    })) as CosSignAminoResponse;

    return { signed: response.signed_doc, signature: { pub_key: response.pub_key, signature: response.signature } };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const signDirect: Keplr['signDirect'] = async (chainId, _, signDoc) => {
  const response = (await request({
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
      authInfoBytes: new Uint8Array(response.signed_doc.auth_info_bytes),
      bodyBytes: new Uint8Array(response.signed_doc.body_bytes),
    },
    signature: { pub_key: response.pub_key, signature: response.signature },
  };
};

const signArbitrary: Keplr['signArbitrary'] = async (chainId, signer, data) => {
  const message = typeof data === 'string' ? data : Buffer.from(data).toString('utf8');
  const response = (await request({ method: 'cos_signMessage', params: { chainName: chainId, signer, message } })) as CosSignMessageResponse;

  return response;
};

const verifyArbitrary: Keplr['verifyArbitrary'] = async (chainId, signer, data, signature) => {
  const message = typeof data === 'string' ? data : Buffer.from(data).toString('utf8');
  const response = (await request({
    method: 'cos_verifyMessage',
    params: { chainName: chainId, signer, message, publicKey: signature.pub_key.value, signature: signature.signature },
  })) as CosVerifyMessageResponse;

  return response;
};

const sendTx: Keplr['sendTx'] = async (chainId, tx, mode) => {
  try {
    const txMode = (() => {
      if (mode === 'block') return 1;
      if (mode === 'sync') return 2;
      if (mode === 'async') return 3;
      return 0;
    })();

    const response = (await request({
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
};

const getOfflineSigner: Keplr['getOfflineSigner'] = (chainId) => ({
  signAmino: async (signerAddress, signDoc) => signAmino(chainId, signerAddress, signDoc),
  signDirect: async (signerAddress, signDoc) => signDirect(chainId, signerAddress, signDoc),
  getAccounts: async () => {
    const response = await getKey(chainId);

    return [{ address: response.bech32Address, pubkey: response.pubKey, algo: response.algo as 'secp256k1' }];
  },
  chainId,
});

const getOfflineSignerOnlyAmino: Keplr['getOfflineSignerOnlyAmino'] = (chainId) => ({
  signAmino: async (signerAddress, signDoc) => signAmino(chainId, signerAddress, signDoc),
  getAccounts: async () => {
    const response = await getKey(chainId);

    return [{ address: response.bech32Address, pubkey: response.pubKey, algo: response.algo as 'secp256k1' }];
  },
  chainId,
});

const getOfflineSignerAuto: Keplr['getOfflineSignerAuto'] = async (chainId) => {
  const account = (await request({
    method: 'cos_requestAccount',
    params: { chainName: chainId },
  })) as CosRequestAccountResponse;

  if (account.isLedger) {
    return getOfflineSignerOnlyAmino(chainId);
  }
  return getOfflineSigner(chainId);
};

export const keplr: Keplr = {
  version: '0.0.0',
  mode: 'extension',
  defaultOptions: {
    sign: { disableBalanceCheck: false, preferNoSetFee: false, preferNoSetMemo: false },
  },
  enable,
  getKey,
  experimentalSuggestChain,
  getOfflineSigner,
  getOfflineSignerAuto,
  getOfflineSignerOnlyAmino,
  sendTx,
  signAmino,
  signDirect,
  signArbitrary,
  verifyArbitrary,
};

// keplr provider end

// legacy

export const tendermint = {
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
              publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')),
            });
          } else if (data.message.method === 'cos_signDirect' || data.message.method === 'ten_signDirect') {
            const result = data.response.result as CosSignDirectResponse;

            const response: CosSignDirectResponse = {
              ...result,
              signed_doc: {
                ...result.signed_doc,
                auth_info_bytes: new Uint8Array(result.signed_doc.auth_info_bytes),
                body_bytes: new Uint8Array(result.signed_doc.body_bytes),
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
              auth_info_bytes: doc.auth_info_bytes ? [...Array.from(new Uint8Array(doc.auth_info_bytes))] : doc.auth_info_bytes,
              body_bytes: doc.body_bytes ? [...Array.from(new Uint8Array(doc.body_bytes))] : doc.body_bytes,
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
};
