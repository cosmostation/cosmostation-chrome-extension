import PromisePool from '@supercharge/promise-pool';

import type { AccountAddress, AccountAddressDelegationsIota } from '@/types/account';
import type { IotaChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertIotaDelegation } from '@/utils/balanceUpsert';
import { fetchIotaDelegations } from '@/utils/iota/fetch/staking';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function iotaStaking(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredAccountAddresses(accountId, 'iota', { chainId, priority });

  let stored = (await getExtensionLocalStorage(`${accountId}-delegation-iota`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getIotaDelegationsForAddresses(accountId, startUpdateTime, chunk);

    stored = upsertIotaDelegation(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-iota`>>({ [`${accountId}-delegation-iota`]: stored });

    updateAssets?.();
  }
}

async function getIotaDelegationsForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: IotaChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const response = await fetchIotaDelegations(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const delegations = response ?? [];

        const result: AccountAddressDelegationsIota = { id: accountId, chainId, chainType, address, delegations, lastUpdatedAtMs: startUpdateTime };

        return result;
      } catch {
        const result: AccountAddressDelegationsIota = { id: accountId, chainId, chainType, address, delegations: [], lastUpdatedAtMs: startUpdateTime };

        return result;
      }
    });

  return results;
}
