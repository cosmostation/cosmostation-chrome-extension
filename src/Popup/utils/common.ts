import { getAddress as getBech32Address } from '~/Popup/utils/cosmos';
import { aesDecrypt, mnemonicToPair, privateKeyToPair } from '~/Popup/utils/crypto';
import { getAddress as getEthereumAddress } from '~/Popup/utils/ethereum';
import type { Chain } from '~/types/chain';
import type { Account } from '~/types/chromeStorage';

export function getAddress(chain: Chain, publicKey?: Buffer) {
  if (!publicKey) {
    return '';
  }
  if (chain.line === 'COSMOS') {
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

export function upperCaseFirst(text?: string) {
  return text ? `${text.substring(0, 1).toUpperCase()}${text.substring(1).toLowerCase()}` : '';
}
