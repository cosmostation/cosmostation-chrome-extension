import PromisePool from '@supercharge/promise-pool';

import type { AccountAddress, AccountAddressBalanceSui } from '@/types/account';
import type { SuiChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertSuiBalance } from '@/utils/balanceUpsert';
import { getExtensionLocalStorage } from '@/utils/storage';
import { fetchSuiBalances } from '@/utils/sui/fetch/balance';

import { getFilteredAccountAddresses } from '../address';

export async function suiBalances(id: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredAccountAddresses(id, 'sui', { chainId, priority });

  let stored = (await getExtensionLocalStorage(`${id}-balance-sui`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getSuiBalancesForAddresses(id, startUpdateTime, chunk);

    stored = upsertSuiBalance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-sui`>>({ [`${id}-balance-sui`]: stored });

    updateAssets?.();
  }
}

async function getSuiBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: SuiChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balances = await fetchSuiBalances(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceSui = { id: accountId, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceSui = {
          id: accountId,
          chainId,
          chainType,
          address,
          balances: [],
          lastUpdatedAtMs: startUpdateTime,
          status: 'error',
        };

        return result;
      }
    });

  return results;
}
