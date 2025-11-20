import PromisePool from '@supercharge/promise-pool';

import type { AccountAddress, AccountAddressBalanceGno } from '@/types/account';
import type { GnoChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertGnoBalance } from '@/utils/balanceUpsert';
import { devLogger } from '@/utils/devLogger';
import { fetchGnoBalance } from '@/utils/gno/fetch/balance';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function gnoBalances(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  try {
    const startUpdateTime = Date.now();

    const addressWithChain = await getFilteredAccountAddresses(accountId, 'gno', { chainId, priority });

    let stored = (await getExtensionLocalStorage(`${accountId}-balance-gno`)) || [];

    const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

    for (const chunk of chunks) {
      const results = await getGnoBalancesForAddresses(accountId, startUpdateTime, chunk);

      stored = upsertGnoBalance(stored, results);

      await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-gno`>>({ [`${accountId}-balance-gno`]: stored });

      updateAssets?.();
    }
  } catch (error) {
    devLogger.error(`Failed to process gnoBalances for account ${accountId}:`, error);
  }
}

async function getGnoBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: GnoChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balance = await fetchGnoBalance(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceGno = { id: accountId, chainId, chainType, address, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceGno = {
          id: accountId,
          chainId,
          chainType,
          address,
          balance: '0',
          lastUpdatedAtMs: startUpdateTime,
          status: 'error',
        };

        return result;
      }
    });

  return results;
}
