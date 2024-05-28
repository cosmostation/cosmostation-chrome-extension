import { v4 as uuidv4 } from 'uuid';
import type { CosmosRegisterWallet } from '@cosmostation/wallets';

import { LINE_TYPE } from '~/constants/chain';
import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_WALLET_NAME } from '~/constants/common';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '~/constants/error';
import { MESSAGE_TYPE } from '~/constants/message';
import { CosmosRPCError } from '~/Popup/utils/error';
import type { SignAminoDoc } from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';
import type { ContentScriptToWebEventMessage, CosmosListenerType, CosmosRequestMessage, ListenerMessage, ResponseMessage } from '~/types/message';
import type {
  CosRequestAccount,
  CosRequestAccountResponse,
  CosSendTransactionResponse,
  CosSignAminoResponse,
  CosSignDirectParams,
  CosSignDirectResponse,
  CosSignMessageResponse,
  CosSupportedChainIdsResponse,
  CosVerifyMessageResponse,
} from '~/types/message/cosmos';

export const executeRequest = (message: CosmosRequestMessage) =>
  new Promise((res, rej) => {
    const messageId = uuidv4();

    const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, CosmosRequestMessage>>) => {
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
      line: LINE_TYPE.COSMOS,
      type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
      messageId,
      message,
    });
  });

export const request = async (message: CosmosRequestMessage) => {
  if (
    message.method === 'cos_requestAccount' ||
    message.method === 'cos_account' ||
    message.method === 'ten_requestAccount' ||
    message.method === 'ten_account'
  ) {
    const result = (await executeRequest(message)) as CosRequestAccountResponse;

    const { publicKey } = result;

    const response = {
      ...(result as { publicKey: string; address: string }),
      publicKey: new Uint8Array(Buffer.from(publicKey, 'hex')),
    };

    return response;
  }

  if (message.method === 'cos_requestAccounts') {
    const supportedChainIds = (await executeRequest({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

    const isValidChainIds = message.params?.chainIds?.every(
      (chainId) => supportedChainIds?.official?.includes(chainId) || supportedChainIds?.unofficial?.includes(chainId),
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
    } as CosRequestAccount;

    await executeRequest(initialAccountRequestMessage);

    const result = await Promise.all(
      message.params.chainIds.map(
        async (chainId) => (await executeRequest({ method: 'cos_requestAccount', params: { chainName: chainId } })) as CosRequestAccountResponse,
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

    const result = (await executeRequest(newMessage)) as CosSignDirectResponse;

    const response: CosSignDirectResponse = {
      ...result,
      signed_doc: {
        ...result.signed_doc,
        auth_info_bytes: new Uint8Array(result.signed_doc.auth_info_bytes),
        body_bytes: new Uint8Array(result.signed_doc.body_bytes),
      },
    };

    return response;
  }

  if (message.method === 'cos_sendTransaction') {
    const { params } = message;

    const txBytes = params?.txBytes && typeof params.txBytes === 'object' ? Buffer.from(params.txBytes).toString('base64') : params.txBytes;

    const newParams = { ...params, txBytes };
    const newMessage = { ...message, params: newParams };

    return executeRequest(newMessage);
  }

  return executeRequest(message);
};

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

const enable: Keplr['enable'] = async (chainIds?: string[] | string) => {
  if (!chainIds) {
    throw new Error('chain id not set');
  }

  const inputChainIds = typeof chainIds === 'string' ? [chainIds] : chainIds;

  const response = (await request({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

  const suppotedChainIds = [...response.official, ...response.unofficial];

  const invalidChainId = inputChainIds.find((chainId) => !suppotedChainIds.includes(chainId));

  if (invalidChainId) {
    throw new Error(`There is no chain info for ${invalidChainId}`);
  }

  await request({ method: 'cos_requestAccount', params: { chainName: inputChainIds[0] } });
};

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
      isKeystone: false,
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
          coinType: `${String(chainInfo.bip44.coinType)}'`,
          gasRate: chainInfo.feeCurrencies[0].gasPriceStep
            ? {
                tiny: String(chainInfo.feeCurrencies[0].gasPriceStep.low),
                low: String(chainInfo.feeCurrencies[0].gasPriceStep.average),
                average: String(chainInfo.feeCurrencies[0].gasPriceStep.high),
              }
            : undefined,
        },
      });
    }
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const signAmino: Keplr['signAmino'] = async (chainId, _, signDoc, signOptions) => {
  try {
    const response = (await request({
      method: 'cos_signAmino',
      params: {
        chainName: chainId,
        isEditFee: !(signOptions?.preferNoSetFee ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetFee),
        isEditMemo: !(signOptions?.preferNoSetMemo ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetMemo),
        isCheckBalance: !(signOptions?.disableBalanceCheck ?? window.cosmostation.providers.keplr.defaultOptions.sign?.disableBalanceCheck),
        doc: signDoc as unknown as SignAminoDoc,
      },
    })) as CosSignAminoResponse;

    return { signed: response.signed_doc, signature: { pub_key: response.pub_key, signature: response.signature } };
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
};

const signDirect: Keplr['signDirect'] = async (chainId, _, signDoc, signOptions) => {
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
      isEditFee: !(signOptions?.preferNoSetFee ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetFee),
      isEditMemo: !(signOptions?.preferNoSetMemo ?? window.cosmostation.providers.keplr.defaultOptions.sign?.preferNoSetMemo),
      isCheckBalance: !(signOptions?.disableBalanceCheck ?? window.cosmostation.providers.keplr.defaultOptions.sign?.disableBalanceCheck),
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

const getOfflineSigner: Keplr['getOfflineSigner'] = (chainId, signOptions) => ({
  signAmino: async (signerAddress, signDoc) => signAmino(chainId, signerAddress, signDoc, signOptions),
  signDirect: async (signerAddress, signDoc) => signDirect(chainId, signerAddress, signDoc, signOptions),
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

const suggestToken: Keplr['suggestToken'] = async (chainId, contractAddress) => {
  try {
    await request({
      method: 'cos_addTokensCW20',
      params: {
        chainName: chainId,
        tokens: [
          {
            contractAddress,
          },
        ],
      },
    });
  } catch (e) {
    throw new Error((e as { message?: string }).message || 'Unknown Error');
  }
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
  suggestToken,
};

// keplr provider end

export const cosmosWallet: CosmosRegisterWallet = {
  name: COSMOSTATION_WALLET_NAME,
  logo: COSMOSTATION_ENCODED_LOGO_IMAGE,
  methods: {
    connect: async (chainIds) => {
      const cIds = typeof chainIds === 'string' ? [chainIds] : chainIds;

      const response = (await request({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

      if (!cIds.every((cId) => response.official.includes(cId) || response.unofficial.includes(cId))) {
        throw new Error('Unsupported chainId is exist');
      }

      await request({ method: 'cos_requestAccount', params: { chainName: cIds[0] } });
    },
    getAccount: async (chainID) => {
      try {
        const account = (await request({
          method: 'cos_requestAccount',
          params: { chainName: chainID },
        })) as CosRequestAccountResponse;

        return {
          name: account.name,
          is_ledger: !!account.isLedger,
          public_key: {
            type: account.isEthermint ? 'ethsecp256k1' : 'secp256k1',
            value: Buffer.from(account.publicKey).toString('base64'),
          },
          address: account.address,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    signAmino: async (chainID, document, options) => {
      try {
        const response = (await request({
          method: 'cos_signAmino',
          params: {
            chainName: chainID,
            doc: document as unknown as SignAminoDoc,
            isEditFee: options?.edit_mode?.fee,
            isEditMemo: options?.edit_mode?.memo,
            isCheckBalance: options?.is_check_balance,
          },
        })) as CosSignAminoResponse;

        return {
          signature: response.signature,
          signed_doc: response.signed_doc,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    signDirect: async (chainID, document, options) => {
      const body_bytes =
        typeof document.body_bytes === 'string' ? new Uint8Array(Buffer.from(document.body_bytes, 'hex')) : new Uint8Array(document.body_bytes);
      const auth_info_bytes =
        typeof document.auth_info_bytes === 'string' ? new Uint8Array(Buffer.from(document.auth_info_bytes, 'hex')) : new Uint8Array(document.auth_info_bytes);

      try {
        const response = (await request({
          method: 'cos_signDirect',
          params: {
            chainName: chainID,
            doc: { ...document, body_bytes, auth_info_bytes } as unknown as SignDirectDoc,
            isEditFee: options?.edit_mode?.fee,
            isEditMemo: options?.edit_mode?.memo,
            isCheckBalance: options?.is_check_balance,
          },
        })) as CosSignDirectResponse;

        return {
          signature: response.signature,
          signed_doc: {
            auth_info_bytes: new Uint8Array(response.signed_doc.auth_info_bytes),
            body_bytes: new Uint8Array(response.signed_doc.body_bytes),
          },
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    sendTransaction: async (chainId, txBytes, mode) => {
      const txMode = mode ?? 2;
      const response = (await request({
        method: 'cos_sendTransaction',
        params: {
          chainName: chainId,
          mode: txMode,
          txBytes: txBytes && typeof txBytes === 'object' ? Buffer.from(txBytes).toString('base64') : txBytes,
        },
      })) as CosSendTransactionResponse;

      if (response?.tx_response?.code !== 0) {
        if (typeof response?.tx_response?.raw_log === 'string') {
          throw new Error(response.tx_response.raw_log);
        } else {
          throw new Error('Unknown Error');
        }
      }

      return response.tx_response.txhash;
    },
    getSupportedChainIds: async () => {
      const response = (await request({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

      return [...response.official, ...response.unofficial];
    },
    signMessage: async (chainId, message, signer) => {
      const response = (await request({ method: 'cos_signMessage', params: { chainName: chainId, signer, message } })) as CosSignMessageResponse;

      return { signature: response.signature };
    },
    verifyMessage: async (chainId, message, signer, signature, public_key) => {
      const response = (await request({
        method: 'cos_verifyMessage',
        params: { chainName: chainId, signer, message, publicKey: public_key, signature },
      })) as CosVerifyMessageResponse;

      return response;
    },
    disconnect: async () => {
      await request({ method: 'cos_disconnect', params: undefined });
    },
    addChain: async (chain) => {
      await request({
        method: 'cos_addChain',
        params: {
          addressPrefix: chain.address_prefix,
          baseDenom: chain.base_denom,
          chainId: chain.chain_id,
          chainName: chain.chain_name,
          coinType: chain.coin_type,
          decimals: chain.decimals,
          displayDenom: chain.display_denom,
          gasRate: chain.gas_rate,
          restURL: chain.lcd_url,
          coinGeckoId: chain.coingecko_id,
          cosmWasm: chain.cosmwasm,
          imageURL: chain.image_url,
          type: chain.type,
        },
      });
    },
  },
  events: {
    on: (type, listener) => {
      if (type === 'AccountChanged') {
        window.addEventListener('cosmostation_keystorechange', listener);
      }
    },
    off: (type, listener) => {
      if (type === 'AccountChanged') {
        window.removeEventListener('cosmostation_keystorechange', listener);
      }
    },
  },
};

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
            const response = data.response.result as CosRequestAccountResponse;

            res({
              ...response,
              publicKey: new Uint8Array(Buffer.from(response.publicKey, 'hex')),
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
