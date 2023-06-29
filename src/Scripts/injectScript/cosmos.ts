import { v4 as uuidv4 } from 'uuid';
import type { CosmosWallet } from '@cosmostation/wallets';

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
      pubKey: account.publicKey,
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
      authInfoBytes: response.signed_doc.auth_info_bytes,
      bodyBytes: response.signed_doc.body_bytes,
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
    return getOfflineSigner(chainId);
  }
  return getOfflineSignerOnlyAmino(chainId);
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

export const cosmosWallet: CosmosWallet = {
  name: 'Cosmostation Wallet',
  logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAvxSURBVHgB7Z1/aF1nGce/TbauKy5mRKVKq6cIVbSjjSto62C3LQytKW7Yjnagvdsf04HSbhRFIjPKClPGGpmgDmYbRTd00slKh4UmKcy1f1iTsDokIvdWw6bTuDST1nSO7nzPyWlvb++9531Oz/vr5nzgadK7c0bveZ/3eZ9f73sWwSxra+RD8z9JgIVJNZSZeZkIZbxG2oLuUPaEMhLKG6FcLERJ+KwOhVKGp5OjhHjQfXngrguV4U54QDmUCvx6uD5JZf4ZO0cJxcAvSEUIUJh6m3IAFn2E3SgcOxeEY1CGQejZ74ffD60dZT8MECCOUX16MAtJxqBxSQhQOHo+SAUalCBAMfgLVgkCFIO/oJWgWPP9FfoE3WhBJ1pDz9KLFGRBQ5aFsiSU3yEDZfil7YU0lz1owqImnwdQMB8F3sBycy/i8vMVdDS5YQDF4LcTHMsDqheX4Zd5K0RdSqij0RJQwcLt0Gl3qqGsrP2gfgkooxj8diZAXeGo3gJ4PfuXLu7Gqg+UcONit9yX6TermHxtFI5QRY0VuK7mPzDeD+AhHPi+W7+NTbfsgatQCU5MHsThU9+BZQLEvsAo/1KbCHo0lI/CMzj4/V8Yw8dXfAYus/SG2DqRydeOwzJBKEP8paPmg8/DQ7ZvGETPTQF8oe/WAawNrCdXS5gP8ztqPvCOnncFWL9qF3xj+/r9keWyTJl/JArgZb5/V+kAfIQWywF/JbL4iQLcDs9Yv6p8aU31kc237I4smEWiXVkd8794l/al1+8zDFW3bzDSxtcMjvlaKkAJnsHB98nxawadwVXvL8EikQIE8AiazU2r3Y33pVi2ZJECrIFH9K0biGLqdoF+jEWHMGAqmHX/tfAAzv5991RE90z/t4rp2SpM0tMViBy88xdm0P/LlTh3YQaGqTIV7M10emjriOh6Dv7jz2+M0rAm4bou+bfSIaQVOHxqAKbxxgdg2Cd1/I69/APjg09Y+DkxOSS6J3JszYeFQQc8ICn2SODsH355ELbgbJaadBuJLS8UYBOTJsLZf/gPdqtutDzDoQWSQIfQdFjovALQLLKAIoFlV4ptaIFoiSSYtgLOKwDDPinaa+5dXcCerwP3fbnlZVwCfv3Sg5BASydV+GvBaQVgpkxa7Rs+rdnx+9SngSOjsQJQut7d8vLx6nOYfHUUElgnMFUtdFoBWDaVQHN7TJfj97HVwDO/jWX5B+PPOPgpVoBILRLDws8ZyhA6qwBZwj46frnPfpr7h/fFs56zvx5ageUrWv4vGBZKHcLNYV7AhEPopALEjp887Mvd8ePsfnEsfZY/9kOkkSUsNFEncFIB6PhJZ//QyL3IDc7oIyPxzE9Z4yNoGRpZhxo4+FnCQt3tY84pQJY2L878XNuuZ2fVBr6Wx55IvYRWQBoW6m4fY1fwAByCcfCybllz8o+P3hUVVHJjbg6Y+juw9S71exKFOfn7lpdN/XsC6z9ShiqsfL719py2fQVOWQA6flKTRw9bS9h39EjqYF4FfYUUy8GBzBIW6qoTOKUAmfL9pzXm+we/L7o8GnxGBSkMHZf5Kzrbx5xRgCxtXgz7zs1prKHTAvz0J6JbIiuQ4hBmqRPoah9zQgFix68suUVP2NcIWoHZs6JbVKyAK2GhE07g3RsGxS3e+37Tm6/j1ww6hDcsSZ3VV8BM4Sungb/+peklb739P/w/dO4kW9poIc9dOIvK6yeRF9YtQNawz2ijB5eBqb+JbsHDj6Q6hExbSx3CraEVyDMstK4AD9xxSHQ9zabxHbZcAvZ+TXRLZAU01QnybCK1qgBc95e/R9aPOmypzStyCLOEhQp1AqkVyLN9zKoCZAn7bDROXuK7/aLL47DwG6mXMSy01T5mTQGyVvusQsdOGhZu26ElLGTreR6+gDUF2Lx6t+h6Nla40OalKyxUbR9LfCBGQXnsI7AWBt75yUdxfecS5eufeOGzZsK+NBgWUm7frH4PHUJGEbQgTWBYeH7ubMtUOCfAU8d2YiKcDLw+D6xZgPPCDN4a+6dqXIbLQIvBbIhCaTmqar46etXn/IwbXIZG783dAbamANJzcvKOf6+ZLA6hMCykif/ViQfx+OGN2qqB1pYAWgBJWZTLxXWhvDKV6eDr/GG5mM5d0h+oAvsKnz8U9xs0gX7A0sU340/h93xqeKc4RJTCzaEXYYldpYPiLCA3UUqbKrQRdQ6NyppHmEvY4c55XFbzAL5sn2oKrYA0LFRoHzOJVQXwZftUS6gA0rCQDqEjWK8F+LB9qiUcfKlDSF9AwSE0gfVyMOPZ/7x5Bus+vEP5nviEkEXunL/LkFDqEPauA34xFOcULOJEQ4jr26eU0NQ+phtnuoKnQyvgfVhIC0DzrgqtwLNPtwwLdWPOAnCLVQtc3j6lzOD35A6hwq4inehXAK6NL/4RePLnqZe6un1KGQ/DQn1LAJMkHPRkC7ViQeT6zhtF/YEsKU9NT+AfM3+GE/D7cUOJdGfR0Rdgg/wtQHJ4AjdV1mu2QkHExe1TIqKw8FuiW2xagHwVINlN28y7VSyISDd6OnL69mVS2sCugkuHJfJRAGowD05Q2U2rqU/OgdO3Y/jdpEkerxWAA/7kz9TNGK9X8HyzbJ/qW+eAQ8geQElCiDB6sMS1KwDXPA2eL+sE0pbp6B0CNsNCzv5t6hnNiGefaYMlQFNBhHUCr8JCaUzPqMji7Cf5hIHMZ//rdeCOLer3vPd9sdKMnWp6SdbtU8wqTk2Pwyic+fd9RXRLNHEshX8J+TaE0BGUhDRUgNs+kWo9HuobEeUGrJy+zWSXZO3n7Od3t0y+YaCmgojt7VOpRCeFSR0/4bPSRL4KwHYnOjUSfA8Ls4R9PH1E+pw0kX8mUFNBRLp9ilbASOMIwz5p2lfaQKKR/BVAU0HEyfYxD8O+evRUA7Psp1c4Zi1LWHi3zlez0emV4EDYV4+eaqCmY9YYFs6e+6foJLGupctyP1UjgjN/207RLZHpP/kSXELvvoB2DQtZ8eR+AA/Dvnr0NoQ4EBZy0PnuoEjV84IJH2nYJy0RG0JvTyCXAQ4qe99U4bVcBlo4SuwX6LlpJVb0tD5dRMdu2kuNLhLo+P1I5sCaQv/WMCoAs2Q5b59iA8gj91QaNoIwZ0AroaVtnCGr1PO/rdcpz78W/T2BWauFKXWFRqdv0zJwC7W23bT8d0kHn8ugo4NPzG0OzZIr37KxpUPI2d+/bSxK+lAZeGys1pNDs3wHWrJCAXC5a0gCZ0+KI7k89APo5Ws/OYwzX1ru3ftVZ1K+zTC7PTxLWLilZH8G0fGrfVeQCo6GffWY3RrGGSFB8Zg17WQJ++7/EnzArAJkqRMoHLOmlSzVPpp96RlCljC/OVTTMWvayGKBHMv3t4Kvj6/C5BvEOfhUAskhCbQAnIWso5uEoWibhX11VOkEVmDjFfLMpUt20vqAJ45fDeNcAiZgA4eaInLDkTYvATNUgCpskOX0bZeh0+d4zN+ACSqA4f7pGhgWSh1CV7n/i/CQql0FyBIWuohjbV4CRpMq+Ruh2NlfnaVa6BIe5PubwKLJzUkewJ4VyHLMmkv4O/ujw5oTBRBWaXKGD9FHhzBq8vTO8094jn8kCnAQtvHxQfo7+GSUfyQKMJN8YA1aAOmbuWzCwfcv7Eugxa/yl86aD8+EUoZNolj66dAh7I47b11zDOmvHB8G+vf6PPjkm6FEp2rV98raSQsXmKQaysrkL/XVQMuv5SowwBVj3KhbvrAC7UsVNbOfNOoHkJ3OVOATyhZ+BHGvYCHtIwfQgGYbpoJQxmArPVyQNwzze9Gg8tvZ4ga+yUD9dKYCl3kAGfM8g/DLzBVytQziGuASMAbgYiFeSi5FvgBxaOjLly4klgpyDOcDFEqwYAc/IUChBAt28BMCFD6ByzIOQ1ncIjpwTzgmRvM2ZcS9hD49pHYUjoG116UEiLuJfHpg7SQjcKRwV0bhIJqUSiglOEgZhSLoHvgyPIBHeR6CXw/XZRmBozM+jQCxxlIZCodRXfisRhA7d1o9+zzPz1SBJzuWECvGGsRfrhsLtwOpOv+T8fuZ+Z+JGOEd+e5WzUnmzPkAAAAASUVORK5CYII=',
  methods: {
    requestAccount: async (chainID) => {
      try {
        const account = (await request({
          method: 'cos_requestAccount',
          params: { chainName: chainID },
        })) as CosRequestAccountResponse;

        return {
          name: account.name,
          isLedger: !!account.isLedger,
          publicKey: {
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
            isEditFee: options?.editMode?.fee,
            isEditMemo: options?.editMode?.memo,
          },
        })) as CosSignAminoResponse;

        return {
          publicKey: {
            type: response.pub_key.type === 'tendermint/PubKeySecp256k1' ? 'secp256k1' : 'ethsecp256k1',
            value: response.pub_key.value,
          },
          signature: response.signature,
          signedDoc: response.signed_doc,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    signDirect: async (chainID, document, options) => {
      try {
        const response = (await request({
          method: 'cos_signDirect',
          params: {
            chainName: chainID,
            doc: document as unknown as SignDirectDoc,
            isEditFee: options?.editMode?.fee,
            isEditMemo: options?.editMode?.memo,
          },
        })) as CosSignDirectResponse;

        return {
          publicKey: {
            type: response.pub_key.type === 'tendermint/PubKeySecp256k1' ? 'secp256k1' : 'ethsecp256k1',
            value: response.pub_key.value,
          },
          signature: response.signature,
          signedDoc: response.signed_doc,
        };
      } catch (e) {
        throw new Error((e as { message?: string }).message || 'Unknown Error');
      }
    },
    sendTransaction: async (chainId, txBytes, mode) => {
      const txMode = mode || 0;
      const response = (await request({
        method: 'cos_sendTransaction',
        params: {
          chainName: chainId,
          mode: txMode,
          txBytes: txBytes && typeof txBytes === 'object' ? Buffer.from(txBytes).toString('base64') : txBytes,
        },
      })) as CosSendTransactionResponse;

      return response;
    },

    getSupportedChainIDs: async () => {
      const response = (await request({ method: 'cos_supportedChainIds' })) as CosSupportedChainIdsResponse;

      return [...response.official, ...response.unofficial];
    },
  },
  events: {
    on: (type, listener) => {
      if (type === 'AccountChanged') {
        window.addEventListener('cosmostation_keystore', listener);
      }
    },
    off: (type, listener) => {
      if (type === 'AccountChanged') {
        window.removeEventListener('cosmostation_keystore', listener);
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
};
