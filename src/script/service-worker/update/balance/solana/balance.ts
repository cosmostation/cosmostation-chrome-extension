import PromisePool from '@supercharge/promise-pool';

import type { AccountAddress, AccountAddressBalanceSolana } from '@/types/account';
import type { SolanaChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertSolanaBalance } from '@/utils/balanceUpsert';
import { fetchSolanaBalances } from '@/utils/cosmos/fetch/balance';
import { devLogger } from '@/utils/devLogger';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function solanaBalances(id: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  try {
    const startUpdateTime = Date.now();

    const addressWithChain = await getFilteredAccountAddresses(id, 'solana', { chainId, priority });

    let stored = (await getExtensionLocalStorage(`${id}-balance-solana`)) || [];

    const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

    for (const chunk of chunks) {
      const results = await getSolanaBalancesForAddresses(id, startUpdateTime, chunk);

      stored = upsertSolanaBalance(stored, results);

      await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-solana`>>({ [`${id}-balance-solana`]: stored });

      updateAssets?.();
    }
  } catch (error) {
    devLogger.error(`Failed to process solanaBalances for account ${id}:`, error);
  }
}

async function getSolanaBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: SolanaChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balance = await fetchSolanaBalances(
          address,
          rpcUrls.map((item) => item.url),
        );

        const result: AccountAddressBalanceSolana = {
          id: accountId,
          chainId,
          chainType,
          address,
          balance: balance.value,
          lastUpdatedAtMs: startUpdateTime,
          status: 'success',
        };

        return result;
      } catch {
        const result: AccountAddressBalanceSolana = {
          id: accountId,
          chainId,
          chainType,
          address,
          balance: 0,
          lastUpdatedAtMs: startUpdateTime,
          status: 'error',
        };

        return result;
      }
    });

  return results;
}
