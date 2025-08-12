import { getAccountAddress } from '@/libs/account';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import { loadExtensionStorageStoreFromStorageByKey } from '@/zustand/hooks/useExtensionStorageStore';

import { devLogger } from '../devLogger';
import { getUniqueChainIdWithManual } from '../queryParamGenerator';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export async function checkMissingAddresses() {
  const userAccounts = await getExtensionLocalStorage('userAccounts');
  const chains = await getChains();

  const flatChains = Object.values(chains).flat();
  const flatChainIds = flatChains.map((item) => getUniqueChainIdWithManual(item.id.toString(), item.chainType));

  for (const { id: accountId } of userAccounts) {
    try {
      const userAccountAddressess = await getAccountAddress(accountId);
      const storedChainIdSet = new Set(userAccountAddressess.map((item) => getUniqueChainIdWithManual(item.chainId, item.chainType)));

      if (flatChainIds.some((newChainId) => !storedChainIdSet.has(newChainId))) {
        await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [accountId] });
        await loadExtensionStorageStoreFromStorageByKey(`${accountId}-address`);
      }
    } catch (error) {
      devLogger.error(`[checkMissingAddresses]`, error);
    }
  }
}

export async function fixSeiAddress() {
  const bugFixFlag: Record<string, boolean> | undefined = await getExtensionLocalStorage('bugFix');

  if (bugFixFlag?.['seiAddressBook']) return;

  const params = await getExtensionLocalStorage('paramsV11');

  if (params?.['sei']?.params?.chainlist_params?.is_support_extension_wallet) {
    const userAccounts = await getExtensionLocalStorage('userAccounts');
    let allSuccess = true;

    if (!Array.isArray(userAccounts) || userAccounts.length === 0) return;
    for (const { id: accountId } of userAccounts) {
      try {
        await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [accountId] });
        await loadExtensionStorageStoreFromStorageByKey(`${accountId}-address`);
      } catch (error) {
        devLogger.error(`[fixSeiAddress]`, error);
        allSuccess = false;
      }
    }

    if (allSuccess) {
      const updatedBugFixFlag: Record<string, boolean> = {
        ...(bugFixFlag ?? {}),
        seiAddressBook: true,
      };

      await setExtensionLocalStorage('bugFix', updatedBugFixFlag);
    }
  }
}
