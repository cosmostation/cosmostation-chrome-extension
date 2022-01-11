import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useInMemory } from '~/Popup/hooks/useInMemory';
import { getAddress as getCosmosAddress } from '~/Popup/utils/cosmos';
import { aesDecrypt, mnemonicToPair, privateKeyToPair } from '~/Popup/utils/crypto';
import { getAddress as getEthereumAddress } from '~/Popup/utils/ethereum';
import type { Chain } from '~/types/chain';
import type { Account } from '~/types/chromeStorage';

export function useCurrent() {
  const { currentAccount, setCurrentAccount } = useCurrentAccount();
  const { currentChain, setCurrentChain } = useCurrentChain();
  const { inMemory } = useInMemory();

  const currentKeyPair = getKeyPair(currentAccount, currentChain, inMemory.password);
  const currentAddress = currentKeyPair?.publicKey ? getAddress(currentKeyPair.publicKey, currentChain) : null;

  return { currentAccount, currentChain, currentKeyPair, currentAddress, setCurrentAccount, setCurrentChain };
}

function getKeyPair(account: Account, chain: Chain, password: string | null) {
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

function getAddress(publicKey: Buffer, chain: Chain) {
  if (chain.line === 'COSMOS') {
    return getCosmosAddress(publicKey, chain.bech32Prefix.address);
  }

  if (chain.line === 'ETHEREUM') {
    return getEthereumAddress(publicKey);
  }

  return null;
}
