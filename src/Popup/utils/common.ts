import sha256 from 'crypto-js/sha256';

import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { CRONOS_POS } from '~/constants/chain/cosmos/cronosPos';
import { MEDIBLOC } from '~/constants/chain/cosmos/medibloc';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { SUI } from '~/constants/chain/sui/sui';
import { LANGUAGE_TYPE } from '~/constants/extensionStorage';
import { getAddress as getAptosAddress } from '~/Popup/utils/aptos';
import { getAddress as getBech32Address, getAddressForEthermint } from '~/Popup/utils/cosmos';
import {
  aesDecrypt,
  mnemonicToAptosPair,
  mnemonicToPair,
  mnemonicToSuiPair,
  privateKeyToAptosPair,
  privateKeyToPair,
  privateKeyToSuiPair,
} from '~/Popup/utils/crypto';
import { getAddress as getEthereumAddress } from '~/Popup/utils/ethereum';
import { getAddress as getSuiAddress } from '~/Popup/utils/sui';
import type { Chain } from '~/types/chain';
import type { Account } from '~/types/extensionStorage';

export function getAddress(chain: Chain, publicKey?: Buffer) {
  if (!publicKey) {
    return '';
  }
  if (chain.line === 'COSMOS') {
    if (chain.type === 'ETHERMINT') {
      return getAddressForEthermint(publicKey, chain.bech32Prefix.address);
    }
    return getBech32Address(publicKey, chain.bech32Prefix.address);
  }

  if (chain.line === 'ETHEREUM') {
    return getEthereumAddress(publicKey);
  }

  if (chain.line === 'APTOS') {
    return getAptosAddress(publicKey);
  }

  if (chain.line === 'SUI') {
    return getSuiAddress(publicKey);
  }

  return '';
}

export function getKeyPair(account: Account, chain: Chain, password: string | null) {
  if (password === null) return null;

  if (account.type === 'MNEMONIC') {
    const mnemonic = aesDecrypt(account.encryptedMnemonic, password);

    if (chain.line === 'APTOS') {
      const path = `m/${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${account.bip44.addressIndex}'`;
      return mnemonicToAptosPair(mnemonic, path);
    }

    if (chain.line === 'SUI') {
      const path = `m/${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${account.bip44.addressIndex}'`;
      return mnemonicToSuiPair(mnemonic, path);
    }

    const path = `m/${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${account.bip44.addressIndex}`;
    return mnemonicToPair(mnemonic, path);
  }

  if (account.type === 'PRIVATE_KEY') {
    const privateKey = Buffer.from(aesDecrypt(account.encryptedPrivateKey, password), 'hex');

    if (chain.line === 'APTOS') {
      return privateKeyToAptosPair(privateKey);
    }

    if (chain.line === 'SUI') {
      return privateKeyToSuiPair(privateKey);
    }

    return privateKeyToPair(privateKey);
  }

  if (account.type === 'LEDGER') {
    if (chain.bip44.coinType === COSMOS.bip44.coinType && account.cosmosPublicKey) {
      return { privateKey: null, publicKey: Buffer.from(account.cosmosPublicKey, 'hex') };
    }

    if (chain.bip44.coinType === MEDIBLOC.bip44.coinType && account.mediblocPublicKey) {
      return { privateKey: null, publicKey: Buffer.from(account.mediblocPublicKey, 'hex') };
    }

    if (chain.bip44.coinType === CRONOS_POS.bip44.coinType && account.cryptoOrgPublicKey) {
      return { privateKey: null, publicKey: Buffer.from(account.cryptoOrgPublicKey, 'hex') };
    }

    if (chain.bip44.coinType === ETHEREUM.bip44.coinType && account.ethereumPublicKey) {
      return { privateKey: null, publicKey: Buffer.from(account.ethereumPublicKey, 'hex') };
    }

    if (chain.bip44.coinType === SUI.bip44.coinType && account.suiPublicKey) {
      return { privateKey: null, publicKey: Buffer.from(account.suiPublicKey, 'hex') };
    }

    return null;
  }

  return null;
}

export function getChainIdRegex(chainId: string) {
  const splitedChainId = chainId.split('-');
  const prefixChainId = splitedChainId[0] ?? '';
  const chainIdRegex = new RegExp(`^${prefixChainId || ''}(.*)$`);

  return chainIdRegex;
}

export function getDisplayMaxDecimals(decimals?: number) {
  const maxDisplayDecimals = 8;

  if (decimals === undefined) return 0;

  return decimals < maxDisplayDecimals ? decimals : maxDisplayDecimals;
}

export function getCapitalize(string: string) {
  return string.charAt(0).toUpperCase().concat(string.slice(1));
}

export function getSiteIconURL(domain: string) {
  return `https://icon.horse/icon/${domain}?size=small`;
}

export function isJsonString(str: string): boolean {
  try {
    return typeof JSON.parse(str) === 'object';
  } catch {
    return false;
  }
}

export function convertToLocales(str: string): string {
  if (!str) return '';

  if (str === LANGUAGE_TYPE.EN) return 'en-US';

  if (str === LANGUAGE_TYPE.KO) return 'ko-KR';

  return '';
}

export function chunkArray<T>(data: T[], chunkSize: number) {
  return Array.from({ length: Math.ceil(data.length / chunkSize) }, (_, i) => data.slice(i * chunkSize, i * chunkSize + chunkSize));
}

export function getAddressKey(account?: Account, chain?: Chain) {
  if (!account || !chain) return '';

  const pathWithoutAddressIndex = `${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}`;

  return sha256(`${account.id}${chain.id}${pathWithoutAddressIndex}`).toString();
}
