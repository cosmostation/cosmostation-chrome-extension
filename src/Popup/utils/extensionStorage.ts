import { APTOS_NETWORKS, CHAINS, ETHEREUM_NETWORKS, SUI_NETWORKS } from '~/constants/chain';
import { extensionStorageDefault } from '~/Popup/recoils/extensionStorage';
import type { ExtensionStorage, ExtensionStorageKeys } from '~/types/extensionStorage';

export async function getStorage<T extends ExtensionStorageKeys>(key: T): Promise<ExtensionStorage[T]> {
  if (process.env.BROWSER === 'chrome') {
    return new Promise((res, rej) => {
      chrome.storage.local.get(key, (items) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        res((items ? items[key] : undefined) as ExtensionStorage[T]);
      });
    });
  }
  const localStorage = await browser.storage.local.get(key);

  return localStorage[key] as ExtensionStorage[T];
}

export async function getAllStorage(): Promise<ExtensionStorage> {
  if (process.env.BROWSER === 'chrome') {
    return new Promise((res, rej) => {
      chrome.storage.local.get(null, (items) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        res(items as ExtensionStorage);
      });
    });
  }
  const localStorage = await browser.storage.local.get();

  return localStorage as ExtensionStorage;
}

export async function setStorage<T extends ExtensionStorageKeys>(key: T, value: ExtensionStorage[T]): Promise<true> {
  if (process.env.BROWSER === 'chrome') {
    return new Promise((res, rej) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        res(true);
      });
    });
  }
  await browser.storage.local.set({ [key]: value });
  return true;
}

export async function extensionStorage() {
  const storage = await getAllStorage();

  const storageWithDefault = { ...extensionStorageDefault, ...storage };

  const {
    accounts,
    accountName,
    selectedAccountId,
    additionalEthereumNetworks,
    selectedEthereumNetworkId,
    allowedOrigins,
    allowedChainIds,
    additionalAptosNetworks,
    additionalSuiNetworks,
    selectedAptosNetworkId,
    selectedSuiNetworkId,
  } = storageWithDefault;

  const currentAccount = (() => accounts.find((account) => account.id === selectedAccountId)!)();
  const currentAccountName = accountName[selectedAccountId];

  const currentEthereumNetwork = (() => {
    const ethereumNetworks = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks];

    const networkId = selectedEthereumNetworkId ?? ETHEREUM_NETWORKS[1].id;

    return ethereumNetworks.find((network) => network.id === networkId) ?? ethereumNetworks[0];
  })();

  const currentAptosNetwork = (() => {
    const aptosNetworks = [...APTOS_NETWORKS, ...additionalAptosNetworks];

    const networkId = selectedAptosNetworkId ?? APTOS_NETWORKS[1].id;

    return aptosNetworks.find((network) => network.id === networkId) ?? aptosNetworks[0];
  })();

  const currentSuiNetwork = (() => {
    const suiNetworks = [...SUI_NETWORKS, ...additionalSuiNetworks];

    const networkId = selectedSuiNetworkId ?? SUI_NETWORKS[0].id;

    return suiNetworks.find((network) => network.id === networkId) ?? suiNetworks[0];
  })();

  const currentAllowedChains = CHAINS.filter((chain) => allowedChainIds.includes(chain.id));

  const currentAccountAllowedOrigins = allowedOrigins
    .filter((allowedOrigin) => allowedOrigin.accountId === selectedAccountId)
    .map((allowedOrigin) => allowedOrigin.origin);

  return {
    ...storageWithDefault,
    currentAccount,
    currentAccountName,
    currentEthereumNetwork,
    currentAptosNetwork,
    currentSuiNetwork,
    currentAllowedChains,
    currentAccountAllowedOrigins,
  };
}
