import { browser } from 'wxt/browser';
import PromisePool from '@supercharge/promise-pool';

import type { AccountAddress, AccountAddressBalanceAptosV2 } from '@/types/account';
import type { AptosChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { fetchAptosBalances } from '@/utils/aptos/fetch/balance';
import { chunkArray } from '@/utils/array';
import { upsertAptosBalance } from '@/utils/balanceUpsert';
import { devLogger } from '@/utils/devLogger';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function aptosBalances(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  try {
    const startUpdateTime = Date.now();

    const addressWithChain = await getFilteredAccountAddresses(accountId, 'aptos', { chainId, priority });

    let stored = (await getExtensionLocalStorage(`${accountId}-balance-aptos-v2`)) || [];

    const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

    for (const chunk of chunks) {
      const results = await getAptosBalancesForAddresses(accountId, startUpdateTime, chunk);

      stored = upsertAptosBalance(stored, results);

      await browser.storage.local.set<Pick<ExtensionStorage, `${string}-balance-aptos-v2`>>({ [`${accountId}-balance-aptos-v2`]: stored });

      updateAssets?.();
    }
  } catch (error) {
    devLogger.error(`Failed to process aptosBalances for account ${accountId}:`, error);
  }
}

async function getAptosBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: AptosChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address } = addr;

      try {
        const balances = await fetchAptosBalances(address);

        const result: AccountAddressBalanceAptosV2 = {
          id: accountId,
          chainId,
          chainType,
          address,
          balances,
          lastUpdatedAtMs: startUpdateTime,
          status: 'success',
        };

        return result;
      } catch {
        const result: AccountAddressBalanceAptosV2 = {
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
