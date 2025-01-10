import { v4 as uuidv4 } from 'uuid';

import type { Network } from '~/constants/bitcoin';
import { LINE_TYPE } from '~/constants/chain';
import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_WALLET_NAME } from '~/constants/common';
import { MESSAGE_TYPE } from '~/constants/message';
import { formatPsbtHex } from '~/Popup/utils/bitcoin';
import type { BitcoinListenerType, BitcoinRequestMessage, ContentScriptToWebEventMessage, ListenerMessage, ResponseMessage } from '~/types/message';
import type {
  BitGetAddressResponse,
  BitGetBalanceResponse,
  BitRequestAccountResponse,
  BitSendBitcoinResponse,
  BitSignPsbtResposne,
  BitSignPsbtsResposne,
} from '~/types/message/bitcoin';

const request = (message: BitcoinRequestMessage) =>
  new Promise((res, rej) => {
    const messageId = uuidv4();

    const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, BitcoinRequestMessage>>) => {
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
      line: LINE_TYPE.BITCOIN,
      type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
      messageId,
      message,
    });
  });

const connectWallet = async () => {
  const addressList = (await request({ method: 'bit_requestAccount', params: undefined })) as BitRequestAccountResponse;
  return addressList;
};

const getAccounts = async () => {
  const address = (await request({ method: 'bit_getAddress', params: undefined })) as BitGetAddressResponse;
  return [address];
};

const getAddress = async () => {
  const address = (await request({ method: 'bit_getAddress', params: undefined })) as BitGetAddressResponse;
  return address;
};

const getBalance = async () => {
  const balance = (await request({ method: 'bit_getBalance', params: undefined })) as BitGetBalanceResponse;
  return balance;
};

const getPublicKeyHex = async () => {
  const publicKeyHex = (await request({ method: 'bit_getPublicKeyHex', params: undefined })) as string;
  return publicKeyHex;
};

const getPublicKey = async () => {
  const publicKeyHex = (await request({ method: 'bit_getPublicKeyHex', params: undefined })) as string;
  return publicKeyHex;
};

const signPsbt = async (psbtHex: string) => {
  const formattedPsbt = formatPsbtHex(psbtHex);

  const signedPsbt = (await request({ method: 'bit_signPsbt', params: formattedPsbt })) as BitSignPsbtResposne;
  return signedPsbt;
};

const signPsbts = async (psbtsHexes: string[]) => {
  const formattedPsbts = psbtsHexes.map((psbtHex) => formatPsbtHex(psbtHex));

  const signedPsbts = (await request({ method: 'bit_signPsbts', params: formattedPsbts })) as BitSignPsbtsResposne;
  return signedPsbts;
};

const signMessage = async (message: string, type?: 'ecdsa' | 'bip322-simple') => {
  const typeParam = type || 'ecdsa';

  if (typeParam !== 'ecdsa' && typeParam !== 'bip322-simple') {
    throw new Error('Invalid type');
  }

  const signedMessage = (await request({ method: 'bit_signMessage', params: { message, type: typeParam } })) as string;
  return signedMessage;
};

const signMessageBIP322 = async (message: string) => {
  const signedMessage = (await request({ method: 'bit_signMessage', params: { message, type: 'bip322-simple' } })) as string;
  return signedMessage;
};

const switchNetwork = async (network: Network) => {
  const response = (await request({ method: 'bit_switchNetwork', params: [network] })) as Network;

  return response;
};

const getNetwork = async () => {
  const network = (await request({ method: 'bit_getNetwork', params: undefined })) as Network;

  return network;
};

const sendBitcoin = async (to: string, satAmount: number) => {
  const txId = (await request({ method: 'bit_sendBitcoin', params: { to, satAmount } })) as BitSendBitcoinResponse;
  return txId;
};

const pushTx = async (txHex: string) => {
  const txId = (await request({ method: 'bit_pushTx', params: [txHex] })) as string;
  return txId;
};

export const on = (eventName: BitcoinListenerType, eventHandler: (data: unknown) => void) => {
  const handler = (event: MessageEvent<ListenerMessage>) => {
    if (event.data?.isCosmostation && event.data?.type === eventName && event.data?.line === 'BITCOIN') {
      eventHandler(event.data?.message);
    }
  };

  window.addEventListener('message', handler);

  window.cosmostation.handlerInfos.push({ line: 'BITCOIN', eventName, originHandler: eventHandler, handler });

  return handler;
};

const off = (eventName: BitcoinListenerType, eventHandler: (data: unknown) => void) => {
  const handlerInfos = window.cosmostation.handlerInfos.filter(
    (item) => item.line === 'BITCOIN' && item.eventName === eventName && item.originHandler === eventHandler,
  );
  const notHandlerInfos = window.cosmostation.handlerInfos.filter(
    (item) => !(item.line === 'BITCOIN' && item.eventName === eventName && item.originHandler === eventHandler),
  );

  handlerInfos.forEach((handlerInfo) => {
    window.removeEventListener('message', handlerInfo.handler);
  });

  window.cosmostation.handlerInfos = notHandlerInfos;
};

// eslint-disable-next-line @typescript-eslint/require-await
const getWalletProviderName = async () => COSMOSTATION_WALLET_NAME;
// eslint-disable-next-line @typescript-eslint/require-await
const getWalletProviderIcon = async () => COSMOSTATION_ENCODED_LOGO_IMAGE;

export const bitcoin = {
  connectWallet,
  getWalletProviderName,
  getWalletProviderIcon,
  getAddress,
  getAccounts,
  getBalance,
  getPublicKeyHex,
  getPublicKey,
  signPsbt,
  signPsbts,
  getNetwork,
  signMessageBIP322,
  signMessage,
  on,
  off,
  switchNetwork,
  sendBitcoin,
  pushTx,
};
