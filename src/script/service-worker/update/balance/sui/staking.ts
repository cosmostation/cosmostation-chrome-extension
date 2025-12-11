import { browser } from 'wxt/browser';
import PromisePool from '@supercharge/promise-pool';

import type { AccountAddress, AccountAddressDelegationsSui } from '@/types/account';
import type { SuiChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertSuiDelegation } from '@/utils/balanceUpsert';
import { devLogger } from '@/utils/devLogger';
import { getExtensionLocalStorage } from '@/utils/storage';
import { fetchSuiDelegations } from '@/utils/sui/fetch/staking';

import { getFilteredAccountAddresses } from '../address';

export async function suiStaking(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  try {
    const startUpdateTime = Date.now();

    const addressWithChain = await getFilteredAccountAddresses(accountId, 'sui', { chainId, priority });

    let stored = (await getExtensionLocalStorage(`${accountId}-delegation-sui`)) || [];

    const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

    for (const chunk of chunks) {
      const results = await getSuiDelegationsForAddresses(accountId, startUpdateTime, chunk);

      stored = upsertSuiDelegation(stored, results);

      await browser.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-sui`>>({ [`${accountId}-delegation-sui`]: stored });

      updateAssets?.();
    }
  } catch (error) {
    devLogger.error(`Failed to process suiStaking for account ${accountId}:`, error);
  }
}

async function getSuiDelegationsForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: SuiChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const response = await fetchSuiDelegations(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const delegations = response ?? [];

        const result: AccountAddressDelegationsSui = { id: accountId, chainId, chainType, address, delegations, lastUpdatedAtMs: startUpdateTime };

        return result;
      } catch {
        const result: AccountAddressDelegationsSui = { id: accountId, chainId, chainType, address, delegations: [], lastUpdatedAtMs: startUpdateTime };

        return result;
      }
    });
  return results;
}
