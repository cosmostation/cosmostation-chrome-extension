import { produce } from 'immer';

import { getAddedCustomChains, getChains } from '@/libs/chain';
import type { AccountAddress } from '@/types/account';
import type { ExtensionStorage, ExtensionStorageKeys } from '@/types/extension';

import { extension } from '../browser';
import { getUniqueChainId, isMatchingUniqueChainId } from '../queryParamGenerator';

async function getExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T) {
  const localStorage = await extension.storage.local.get(key);

  return localStorage[key] as ExtensionStorage[T];
}

export async function getCosmosDefaultStorageData() {
  const { userAccounts, approvedOrigins, currentAccountId, accountNamesById, preferAccountType } = await chrome.storage.local.get<ExtensionStorage>([
    'userAccounts',
    'approvedOrigins',
    'currentAccountId',
    'accountNamesById',
    'preferAccountType',
  ]);

  const currentAccount = userAccounts?.find((account) => account.id === currentAccountId);

  const currentAccountAllowedOrigins = approvedOrigins
    .filter((allowedOrigin) => allowedOrigin.accountId === currentAccountId)
    .map((allowedOrigin) => allowedOrigin.origin);

  const currentAccountName = accountNamesById[currentAccountId];

  const currentAccountAddressInfo: AccountAddress[] = (await chrome.storage.local.get(`${currentAccountId}-address`))[`${currentAccountId}-address`] || [];

  return {
    currentAccount,
    currentAccountAllowedOrigins,
    currentAccountName,
    approvedOrigins,
    preferAccountType,
    currentAccountAddressInfo,
  };
}

async function getCurrentAccount() {
  const { userAccounts, currentAccountId } = await chrome.storage.local.get<ExtensionStorage>(['userAccounts', 'currentAccountId']);

  const currentAccount = userAccounts?.find((account) => account.id === currentAccountId);

  return currentAccount;
}

async function getCurrentApprovedOrigins() {
  const approvedOrigins = (await getExtensionLocalStorage('approvedOrigins')) || [];
  const currentAccount = await getCurrentAccount();

  const currentAccountAllowedOrigins = approvedOrigins
    .filter((allowedOrigin) => allowedOrigin.accountId === currentAccount?.id)
    .map((allowedOrigin) => allowedOrigin.origin);

  return currentAccountAllowedOrigins;
}

export async function getCurrentEVMNetwork() {
  const chosenEthereumNetworkId = await getExtensionLocalStorage('chosenEthereumNetworkId');

  const { evmChains } = await getChains();
  const addedCustomChains = await getAddedCustomChains();

  const customEVMChains = addedCustomChains.filter((chain) => chain.chainType === 'evm');
  const allEthereumNetworks = [...evmChains, ...customEVMChains];

  return {
    evmChains,
    customEVMChains,
    allEthereumNetworks,
    currentEthereumNetwork: !chosenEthereumNetworkId
      ? allEthereumNetworks[0]
      : (allEthereumNetworks.find((network) => isMatchingUniqueChainId(network, chosenEthereumNetworkId)) ?? allEthereumNetworks[0]),
  };
}

export async function getEVMDefaultStorageData() {
  const networkData = await getCurrentEVMNetwork();
  const currentAccountAllowedOrigins = await getCurrentApprovedOrigins();
  const currentAccount = await getCurrentAccount();

  return {
    ...networkData,
    currentAccountAllowedOrigins,
    currentAccount,
  };
}

async function getCurrentAccountAddressInfo() {
  const currentAccount = await getCurrentAccount();

  const currentAccountAddressInfo: AccountAddress[] = (await getExtensionLocalStorage(`${currentAccount?.id}-address`)) || [];

  return currentAccountAddressInfo;
}

export async function getCurrentEVMAddressInfo() {
  const currentAccountAddressInfo = (await getCurrentAccountAddressInfo()) || [];

  return currentAccountAddressInfo.find((info) => info.chainId === 'ethereum' && info.chainType === 'evm');
}

export async function getCommonDefaultStorageData() {
  const prioritizedProvider = await getExtensionLocalStorage('prioritizedProvider');

  return { prioritizedProvider };
}

export async function getCurrentAptosNetwork() {
  const chosenAptosNetworkId = await getExtensionLocalStorage('chosenAptosNetworkId');

  const { aptosChains } = await getChains();

  const networkId = chosenAptosNetworkId ?? getUniqueChainId(aptosChains[0]);

  return {
    aptosChains,
    currentAptosNetwork: aptosChains.find((network) => isMatchingUniqueChainId(network, networkId)) ?? aptosChains[0],
  };
}

export async function getAptosDefaultStorageData() {
  const { userAccounts, approvedOrigins, currentAccountId } = await chrome.storage.local.get<ExtensionStorage>([
    'userAccounts',
    'approvedOrigins',
    'currentAccountId',
  ]);

  const currentAccount = userAccounts?.find((account) => account.id === currentAccountId);

  const currentAccountAllowedOrigins = approvedOrigins
    .filter((allowedOrigin) => allowedOrigin.accountId === currentAccountId)
    .map((allowedOrigin) => allowedOrigin.origin);

  const aptosNetworkInfo = await getCurrentAptosNetwork();

  return {
    currentAccount,
    currentAccountAllowedOrigins,
    approvedOrigins,
    ...aptosNetworkInfo,
  };
}

export async function getCurrentSuiNetwork() {
  const chosenSuiNetworkId = await getExtensionLocalStorage('chosenSuiNetworkId');

  const { suiChains } = await getChains();

  return {
    suiChains,
    currentSuiNetwork: suiChains.find((network) => isMatchingUniqueChainId(network, chosenSuiNetworkId)) ?? suiChains[0],
  };
}

export async function getSuiDefaultStorageData() {
  const { userAccounts, approvedOrigins, currentAccountId, approvedSuiPermissions } = await chrome.storage.local.get<ExtensionStorage>([
    'userAccounts',
    'approvedOrigins',
    'currentAccountId',
    'approvedSuiPermissions',
  ]);

  const currentAccount = userAccounts?.find((account) => account.id === currentAccountId);

  const currentAccountAllowedOrigins =
    approvedOrigins?.filter((allowedOrigin) => allowedOrigin.accountId === currentAccountId).map((allowedOrigin) => allowedOrigin.origin) || [];

  const suiNetworkInfo = await getCurrentSuiNetwork();

  return {
    currentAccount,
    currentAccountAllowedOrigins,
    approvedOrigins,
    approvedSuiPermissions: approvedSuiPermissions || [],
    ...suiNetworkInfo,
  };
}

export async function getCurrentBitcoinNetwork() {
  const { chosenBitcoinNetworkId, preferAccountType, currentAccountId } = await chrome.storage.local.get<ExtensionStorage>([
    'chosenBitcoinNetworkId',
    'preferAccountType',
    'currentAccountId',
  ]);

  const { bitcoinChains } = await getChains();

  const network = bitcoinChains.find((network) => isMatchingUniqueChainId(network, chosenBitcoinNetworkId)) ?? bitcoinChains[0];

  const inAppSelectedPubkeyStyle = preferAccountType[currentAccountId]?.[network.id].pubkeyStyle;

  const currentBitcoinNetwork = produce(network, (draft) => {
    draft.accountTypes = draft.accountTypes.filter((item) => item.pubkeyStyle === inAppSelectedPubkeyStyle);
  });

  return {
    bitcoinChains,
    currentBitcoinNetwork,
  };
}

export async function getBitcoinDefaultStorageData() {
  const { userAccounts, approvedOrigins, currentAccountId } = await chrome.storage.local.get<ExtensionStorage>([
    'userAccounts',
    'approvedOrigins',
    'currentAccountId',
  ]);

  const currentAccount = userAccounts?.find((account) => account.id === currentAccountId);

  const currentAccountAllowedOrigins =
    approvedOrigins?.filter((allowedOrigin) => allowedOrigin.accountId === currentAccountId).map((allowedOrigin) => allowedOrigin.origin) || [];

  const bitcoinNetworkInfo = await getCurrentBitcoinNetwork();

  return {
    currentAccount,
    currentAccountAllowedOrigins,
    approvedOrigins,
    ...bitcoinNetworkInfo,
  };
}

export async function getCurrentIotaNetwork() {
  const chosenIotaNetworkId = await getExtensionLocalStorage('chosenIotaNetworkId');

  const { iotaChains } = await getChains();

  return {
    iotaChains,
    currentIotaNetwork: iotaChains.find((network) => isMatchingUniqueChainId(network, chosenIotaNetworkId)) ?? iotaChains[0],
  };
}

export async function getIotaDefaultStorageData() {
  const { userAccounts, approvedOrigins, currentAccountId, approvedIotaPermissions } = await chrome.storage.local.get<ExtensionStorage>([
    'userAccounts',
    'approvedOrigins',
    'currentAccountId',
    'approvedIotaPermissions',
  ]);

  const currentAccount = userAccounts?.find((account) => account.id === currentAccountId);

  const currentAccountAllowedOrigins =
    approvedOrigins?.filter((allowedOrigin) => allowedOrigin.accountId === currentAccountId).map((allowedOrigin) => allowedOrigin.origin) || [];

  const iotaNetworkInfo = await getCurrentIotaNetwork();

  return {
    currentAccount,
    currentAccountAllowedOrigins,
    approvedOrigins: approvedOrigins || [],
    approvedIotaPermissions: approvedIotaPermissions || [],
    ...iotaNetworkInfo,
  };
}
