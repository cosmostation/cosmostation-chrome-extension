import PromisePool from '@supercharge/promise-pool';

import type { AccountAddress, AccountAddressBalanceIota } from '@/types/account';
import type { IotaChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertIotaBalance } from '@/utils/balanceUpsert';
import { fetchIotaBalances } from '@/utils/iota/fetch/balance';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function iotaBalances(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredAccountAddresses(accountId, 'iota', { chainId, priority });

  let stored = (await getExtensionLocalStorage(`${accountId}-balance-iota`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getIotaBalancesForAddresses(accountId, startUpdateTime, chunk);

    stored = upsertIotaBalance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-iota`>>({ [`${accountId}-balance-iota`]: stored });

    updateAssets?.();
  }
}

async function getIotaBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: IotaChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balances = await fetchIotaBalances(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceIota = { id: accountId, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceIota = {
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
