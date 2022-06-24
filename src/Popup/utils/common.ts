import { aesDecrypt, mnemonicToPair, privateKeyToPair } from '~/Popup/utils/crypto';
import { getAddress as getEthereumAddress } from '~/Popup/utils/ethereum';
import { getAddress as getBech32Address, getAddressForEthermint } from '~/Popup/utils/tendermint';
import type { Chain } from '~/types/chain';
import type { Account } from '~/types/chromeStorage';

export function getAddress(chain: Chain, publicKey?: Buffer) {
  if (!publicKey) {
    return '';
  }
  if (chain.line === 'TENDERMINT') {
    if (chain.type === 'ETHERMINT') {
      return getAddressForEthermint(publicKey, chain.bech32Prefix.address);
    }
    return getBech32Address(publicKey, chain.bech32Prefix.address);
  }

  if (chain.line === 'ETHEREUM') {
    return getEthereumAddress(publicKey);
  }

  return '';
}

export function getKeyPair(account: Account, chain: Chain, password: string | null) {
  if (password === null) return null;

  if (account.type === 'MNEMONIC') {
    const mnemonic = aesDecrypt(account.encryptedMnemonic, password);
    const path = `m/${chain.bip44.purpose}/${chain.bip44.coinType}/${chain.bip44.account}/${chain.bip44.change}/${account.bip44.addressIndex}`;
    return mnemonicToPair(mnemonic, path);
  }

  if (account.type === 'PRIVATE_KEY') {
    const privateKey = aesDecrypt(account.encryptedPrivateKey, password);
    return privateKeyToPair(Buffer.from(privateKey, 'hex'));
  }

  return null;
}

export function getChainIdRegex(chainId: string) {
  const splitedChainId = chainId.split('-');
  const prefixChainId = splitedChainId[0] ?? '';
  const chainIdRegex = new RegExp(`^${prefixChainId || ''}(.*)$`);

  return chainIdRegex;
}

type toHexOptions = {
  addPrefix?: boolean;
  isStringNumber?: boolean;
};

export function getDisplayMaxDecimals(decimals?: number) {
  const maxDisplayDecimals = 8;

  if (decimals === undefined) return 0;

  return decimals < maxDisplayDecimals ? decimals : maxDisplayDecimals;
}

export function toHex(datum?: number | string, options?: toHexOptions) {
  const result = (() => {
    if (typeof datum === 'number') {
      return datum.toString(16);
    }

    if (typeof datum === 'string') {
      if (/^[0-9]+$/.test(datum) && options?.isStringNumber) {
        return BigInt(datum).toString(16);
      }

      if (datum.startsWith('0x')) {
        return datum.substring(2);
      }
      return Buffer.from(datum, 'utf8').toString('hex');
    }

    return '';
  })();

  if (options?.addPrefix) {
    return `0x${result}`;
  }

  return result;
}
