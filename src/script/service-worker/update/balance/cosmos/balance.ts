import PromisePool from '@supercharge/promise-pool';

import { COREUM_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { getCustomAccountAddress } from '@/libs/account';
import type { AccountAddress, AccountAddressBalanceCosmos, AccountAddressLockedBalanceCosmos } from '@/types/account';
import type { CosmosChain, CustomCosmosChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertCosmosBalance } from '@/utils/balanceUpsert';
import { createChainMap } from '@/utils/cache/chainMap';
import { fetchCoreumSpendableBalances, fetchCosmosBalances } from '@/utils/cosmos/fetch/balance';
import { minus } from '@/utils/numbers';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function cosmosBalances(accountId: string, { isMinimal = false, chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredAccountAddresses(accountId, 'cosmos', { isMinimal, chainId, priority });

  let stored = (await getExtensionLocalStorage(`${accountId}-balance-cosmos`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getCosmosBalancesForAddresses(accountId, startUpdateTime, chunk);

    stored = upsertCosmosBalance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cosmos`>>({ [`${accountId}-balance-cosmos`]: stored });

    updateAssets?.();
  }
}

async function getCosmosBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: CosmosChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const cosmosChain = chain;
      const { lcdUrls, mainAssetDenom } = cosmosChain;

      try {
        const balances = await fetchCosmosBalances(address, lcdUrls.map((item) => item.url).filter(Boolean));

        if (chainId === COREUM_CHAINLIST_ID) {
          try {
            const spendableBalances = await fetchCoreumSpendableBalances(address, lcdUrls.map((item) => item.url).filter(Boolean));

            const totalBalance = balances.find((item) => item.denom === mainAssetDenom);
            const spendableBalance = spendableBalances.find((item) => item.denom === mainAssetDenom);

            const lockedAmount = minus(totalBalance?.amount || '0', spendableBalance?.amount || '0');

            const lockedAssetInfo = {
              denom: mainAssetDenom,
              amount: lockedAmount,
            };

            const lockedResult: AccountAddressLockedBalanceCosmos = {
              id: accountId,
              chainId,
              chainType,
              address,
              lockedBalances: [lockedAssetInfo],
            };

            await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-locked-cosmos`>>({ [`${accountId}-locked-cosmos`]: [lockedResult] });

            const result: AccountAddressBalanceCosmos = {
              id: accountId,
              chainId,
              chainType,
              address,
              balances: spendableBalances,
              lastUpdatedAtMs: startUpdateTime,
              status: 'success',
            };

            return result;
          } catch {
            await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-locked-cosmos`>>({ [`${accountId}-locked-cosmos`]: [] });

            const result: AccountAddressBalanceCosmos = {
              id: accountId,
              chainId,
              chainType,
              address,
              balances,
              lastUpdatedAtMs: startUpdateTime,
              status: 'error',
            };
            return result;
          }
        }

        const result: AccountAddressBalanceCosmos = {
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
        const result: AccountAddressBalanceCosmos = {
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

export async function customCosmosBalances(accountId: string, { chainId, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const customAccountAddress = await getCustomAccountAddress(accountId);
  const chainMapInstance = await createChainMap('cosmos');

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? customAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : customAccountAddress;

  const targetChain = chainId && chainMapInstance?.get(chainId);

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || chainMapInstance?.get(getUniqueChainIdWithManual(addr.chainId, addr.chainType));
      return chain ? { ...addr, chain } : null;
    })
    .filter((item) => !!item);

  let stored = (await getExtensionLocalStorage(`${accountId}-custom-balance-cosmos`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getCustomCosmosBalancesForAddresses(accountId, startUpdateTime, chunk);

    stored = upsertCosmosBalance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cosmos`>>({ [`${accountId}-custom-balance-cosmos`]: stored });

    updateAssets?.();
  }
}

async function getCustomCosmosBalancesForAddresses(
  accountId: string,
  startUpdateTime: number,
  addressesWithChain: (AccountAddress & { chain: CustomCosmosChain })[],
) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        const balances = await fetchCosmosBalances(address, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceCosmos = {
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
        const result: AccountAddressBalanceCosmos = {
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
