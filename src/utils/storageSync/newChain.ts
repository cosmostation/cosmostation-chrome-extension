import { getAccountAddress } from '@/libs/account';
import { getChains } from '@/libs/chain';
import { sendMessage } from '@/libs/extension';
import { loadExtensionStorageStoreFromStorageByKey } from '@/zustand/hooks/useExtensionStorageStore';

import { devLogger } from '../devLogger';
import { getUniqueChainIdWithManual } from '../queryParamGenerator';
import { getExtensionLocalStorage } from '../storage';

export async function checkMissingAddresses() {
  const userAccounts = await getExtensionLocalStorage('userAccounts');
  const chains = await getChains();

  const flatChains = Object.values(chains).flat();
  const flatChainIds = flatChains.map((item) => getUniqueChainIdWithManual(item.id.toString(), item.chainType));

  for (const { id: accountId } of userAccounts) {
    try {
      const userAccountAddressess = await getAccountAddress(accountId);
      const userAccountSet = new Set(userAccountAddressess.map((item) => getUniqueChainIdWithManual(item.chainId, item.chainType)));

      if (flatChainIds.some((aa) => !userAccountSet.has(aa))) {
        await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [accountId] });
        await loadExtensionStorageStoreFromStorageByKey(`${accountId}-address`);
      }
    } catch (error) {
      devLogger.error(`[checkMissingAddresses]`, error);
    }
  }
}
