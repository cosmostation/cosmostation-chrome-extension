/* eslint-disable @typescript-eslint/no-empty-function */

import type { Network } from '@/constants/bitcoin/common';
import { COSMOSTATION_ENCODED_LOGO_IMAGE, COSMOSTATION_WALLET_NAME } from '@/constants/common';
import type { BitcoinListenerType, EventDetail } from '@/types/message';
import type {
  BitGetAddressResponse,
  BitGetBalanceResponse,
  BitRequestAccountResponse,
  BitSendBitcoinResponse,
  BitSignPsbtResposne,
  BitSignPsbtsResposne,
} from '@/types/message/inject/bitcoin';

import { bitcoinRequestApp } from '../request';
import { formatPsbtHex } from '../utils';

const connectWallet = async () => {
  const addressList = (await bitcoinRequestApp({ method: 'bit_requestAccount', params: undefined })) as BitRequestAccountResponse;
  return addressList;
};

const getAccounts = async () => {
  const address = (await bitcoinRequestApp({ method: 'bit_getAddress', params: undefined })) as BitGetAddressResponse;
  return [address];
};

const getAddress = async () => {
  const address = (await bitcoinRequestApp({ method: 'bit_getAddress', params: undefined })) as BitGetAddressResponse;
  return address;
};

const getBalance = async () => {
  const balance = (await bitcoinRequestApp({ method: 'bit_getBalance', params: undefined })) as BitGetBalanceResponse;
  return balance;
};

const getPublicKeyHex = async () => {
  const publicKeyHex = (await bitcoinRequestApp({ method: 'bit_getPublicKeyHex', params: undefined })) as string;
  return publicKeyHex;
};

const getPublicKey = async () => {
  const publicKeyHex = (await bitcoinRequestApp({ method: 'bit_getPublicKeyHex', params: undefined })) as string;
  return publicKeyHex;
};

const signPsbt = async (psbtHex: string) => {
  const formattedPsbt = formatPsbtHex(psbtHex);

  const signedPsbt = (await bitcoinRequestApp({ method: 'bit_signPsbt', params: formattedPsbt })) as BitSignPsbtResposne;
  return signedPsbt;
};

const signPsbts = async (psbtsHexes: string[]) => {
  const formattedPsbts = psbtsHexes.map((psbtHex) => formatPsbtHex(psbtHex));

  const signedPsbts = (await bitcoinRequestApp({ method: 'bit_signPsbts', params: formattedPsbts })) as BitSignPsbtsResposne;
  return signedPsbts;
};

const signMessage = async (message: string, type?: 'ecdsa' | 'bip322-simple') => {
  const typeParam = type || 'ecdsa';

  if (typeParam !== 'ecdsa' && typeParam !== 'bip322-simple') {
    throw new Error('Invalid type');
  }

  const signedMessage = (await bitcoinRequestApp({ method: 'bit_signMessage', params: { message, type: typeParam } })) as string;
  return signedMessage;
};

const signMessageBIP322 = async (message: string) => {
  const signedMessage = (await bitcoinRequestApp({ method: 'bit_signMessage', params: { message, type: 'bip322-simple' } })) as string;
  return signedMessage;
};

const switchNetwork = async (network: Network) => {
  const response = (await bitcoinRequestApp({ method: 'bit_switchNetwork', params: [network] })) as Network;

  return response;
};

const getNetwork = async () => {
  const network = (await bitcoinRequestApp({ method: 'bit_getNetwork', params: undefined })) as Network;

  return network;
};

const sendBitcoin = async (to: string, satAmount: number) => {
  const txId = (await bitcoinRequestApp({ method: 'bit_sendBitcoin', params: { to, satAmount } })) as BitSendBitcoinResponse;
  return txId;
};

const pushTx = async (txHex: string) => {
  const txId = (await bitcoinRequestApp({ method: 'bit_pushTx', params: [txHex] })) as string;
  return txId;
};

const getWalletProviderName = async () => COSMOSTATION_WALLET_NAME;
const getWalletProviderIcon = async () => COSMOSTATION_ENCODED_LOGO_IMAGE;

export class CosmostationBitcoin implements BitcoinProvider {
  private static instance: BitcoinProvider;

  private accountsChangedEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};

  public static getInstance(): BitcoinProvider {
    if (!CosmostationBitcoin.instance) {
      CosmostationBitcoin.instance = new CosmostationBitcoin();
    }
    return CosmostationBitcoin.instance;
  }

  connectWallet = connectWallet;
  getWalletProviderName = getWalletProviderName;
  getWalletProviderIcon = getWalletProviderIcon;
  getAddress = getAddress;
  getAccounts = getAccounts;
  getBalance = getBalance;
  getPublicKey = getPublicKey;
  getPublicKeyHex = getPublicKeyHex;
  signPsbt = signPsbt;
  signPsbts = signPsbts;
  getNetwork = getNetwork;
  signMessage = signMessage;
  signMessageBIP322 = signMessageBIP322;
  switchNetwork = switchNetwork;
  sendBitcoin = sendBitcoin;
  pushTx = pushTx;

  on(eventName: BitcoinListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'accountChanged') {
      this.accountsChangedEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'bitcoin') {
          eventHandler(event.detail.data.result as string[]);
        }
      };

      window.addEventListener('accountChanged', this.accountsChangedEventHandler as EventListener);
    }
  }

  off(eventName: BitcoinListenerType) {
    if (eventName === 'accountChanged') {
      window.removeEventListener('accountChanged', this.accountsChangedEventHandler as EventListener);
    }
  }
}
