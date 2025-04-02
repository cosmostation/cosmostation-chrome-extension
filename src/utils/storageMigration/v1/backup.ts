import { extension } from '@/utils/browser';

import type { LegacyExtensionStorage } from './migration';

type LegacyExtensionStorageKeys = keyof LegacyExtensionStorage;

const legacyStorageKeys: LegacyExtensionStorageKeys[] = [
  'encryptedPassword',
  'accounts',
  'accountName',
  'queues',
  'theme',
  'currency',
  'windowId',
  'additionalChains',
  'language',
  'addressBook',
  'rootPath',
  'homeTabIndex',
  'selectedAccountId',
  'allowedOrigins',
  'allowedChainIds',
  'shownEthereumNetworkIds',
  'shownAptosNetworkIds',
  'shownSuiNetworkIds',
  'selectedChainId',
  'additionalEthereumNetworks',
  'selectedEthereumNetworkId',
  'additionalAptosNetworks',
  'selectedAptosNetworkId',
  'additionalSuiNetworks',
  'selectedSuiNetworkId',
  'selectedBitcoinChainId',
  'cosmosTokens',
  'ethereumTokens',
  'ethereumNFTs',
  'cosmosNFTs',
  'suiPermissions',
  'ledgerTransportType',
  'providers',
  'address',
];

export async function backupData() {
  const oldData = await chrome.storage.local.get(legacyStorageKeys);
  const dataString = JSON.stringify(oldData);

  await extension.storage.local.set({ backupLocalData: dataString });
}

export async function backupDataWithDownload() {
  const oldData = await extension.storage.local.get(legacyStorageKeys);
  const dataString = JSON.stringify(oldData);
  const blob = new Blob([dataString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const filename = `backup-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.json`;
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.click();
}

export async function ensureBackupData(): Promise<boolean> {
  await backupData();
  const { backupLocalData } = await extension.storage.local.get('backupLocalData');
  return !!backupLocalData;
}

export async function resetLegacyData() {
  const { backupLocalData } = await extension.storage.local.get('backupLocalData');

  if (backupLocalData) {
    await extension.storage.local.remove(legacyStorageKeys);
  }
}
