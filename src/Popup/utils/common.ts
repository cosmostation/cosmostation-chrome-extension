import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { getAddress as getBech32Address, getAddressForEthermint } from '~/Popup/utils/cosmos';
import { aesDecrypt, mnemonicToPair, privateKeyToPair } from '~/Popup/utils/crypto';
import { getAddress as getEthereumAddress } from '~/Popup/utils/ethereum';
import type { Chain } from '~/types/chain';
import type { Account } from '~/types/chromeStorage';

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

  if (account.type === 'LEDGER') {
    if (chain.bip44.coinType === COSMOS.bip44.coinType && account.cosmosPublicKey) {
      return { privateKey: null, publicKey: Buffer.from(account.cosmosPublicKey, 'hex') };
    }

    if (chain.bip44.coinType === ETHEREUM.bip44.coinType && account.ethereumPublicKey) {
      return { privateKey: null, publicKey: Buffer.from(account.ethereumPublicKey, 'hex') };
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

export function getSiteIconURL(domain: string) {
  return `https://icon.horse/icon/${domain}?size=small`;
}
