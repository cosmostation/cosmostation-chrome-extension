import { CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { chromeStorageDefault } from '~/Popup/recoils/chromeStorage';
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

  const storageWithDefault = { ...chromeStorageDefault, ...storage };

  const { accounts, accountName, selectedAccountId, additionalEthereumNetworks, selectedEthereumNetworkId, allowedOrigins, allowedChainIds } =
    storageWithDefault;

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

  return {
    ...storageWithDefault,
    currentAccount,
    currentAccountName,
    currentEthereumNetwork,
    currentAllowedChains,
    currentAccountAllowedOrigins,
  };
}
