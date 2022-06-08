import { CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { ENCTYPT_KEY } from '~/constants/common';
import { aesDecrypt, mnemonicToPair, privateKeyToPair, sha512 } from '~/Popup/utils/crypto';
import type { ChromeStorage, ChromeStorageKeys } from '~/types/chromeStorage';

export function getStorage<T extends ChromeStorageKeys>(key: T): Promise<ChromeStorage[T]> {
  return new Promise((res, rej) => {
    chrome.storage.local.get(key, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res((items ? items[key] : undefined) as ChromeStorage[T]);
    });
  });
}

export function getAllStorage(): Promise<ChromeStorage> {
  return new Promise((res, rej) => {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(items as ChromeStorage);
    });
  });
}

export function setStorage<T extends ChromeStorageKeys>(key: T, value: ChromeStorage[T]): Promise<true> {
  return new Promise((res, rej) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(true);
    });
  });
}

export async function chromeStorage() {
  const storage = await getAllStorage();

  const {
    accounts,
    accountName,
    selectedAccountId,
    additionalEthereumNetworks,
    encryptedPassword,
    selectedEthereumNetworkId,
    allowedOrigins,
    allowedChainIds,
  } = storage;

  const currentAccount = (() => accounts.find((account) => account.id === selectedAccountId)!)();
  const currentAccountName = accountName[selectedAccountId];

  const currentEthereumNetwork = () => {
    const ethereumNetworks = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks];

    const networkId = selectedEthereumNetworkId ?? ETHEREUM_NETWORKS[1].id;

    return ethereumNetworks.find((network) => network.id === networkId) ?? ethereumNetworks[0];
  };

  const currentAllowedChains = CHAINS.filter((chain) => allowedChainIds.includes(chain.id));

  const currentAccountAllowedOrigins = allowedOrigins
    .filter((allowedOrigin) => allowedOrigin.accountId === selectedAccountId)
    .map((allowedOrigin) => allowedOrigin.origin);

  const getPairKey = (chainName: string, password: string) => {
    const chains = Object.values(CHAINS);
    const selectedChain = chains.find((chain) => chain.chainName.toLowerCase() === chainName.toLowerCase());

    if (!selectedChain) {
      throw new Error('not exist chain');
    }

    if (encryptedPassword !== sha512(password)) {
      throw new Error('incorrect password');
    }

    if (currentAccount.type === 'MNEMONIC') {
      const { purpose, coinType, account, change } = selectedChain.bip44;
      const path = `m/${purpose}/${coinType}/${account}/${change}/${currentAccount.bip44.addressIndex}`;

      return mnemonicToPair(aesDecrypt(currentAccount.encryptedMnemonic, password), path);
    }

    return privateKeyToPair(Buffer.from(aesDecrypt(currentAccount.encryptedPrivateKey, password), 'hex'));
  };

  const password = storage.password ? aesDecrypt(storage.password, ENCTYPT_KEY) : null;

  return {
    ...storage,
    currentAccount,
    currentAccountName,
    currentEthereumNetwork,
    currentAllowedChains,
    currentAccountAllowedOrigins,
    password,
    getPairKey,
  };
}
