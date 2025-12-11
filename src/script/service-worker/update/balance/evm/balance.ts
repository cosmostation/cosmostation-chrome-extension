import { browser } from 'wxt/browser';
import PromisePool from '@supercharge/promise-pool';

import { getCustomAccountAddress } from '@/libs/account';
import type { AccountAddress, AccountAddressBalanceEvm } from '@/types/account';
import type { EvmChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertEVMBalance } from '@/utils/balanceUpsert';
import { createChainMap } from '@/utils/cache/chainMap';
import { devLogger } from '@/utils/devLogger';
import { fetchEVMBalances } from '@/utils/ethereum/fetch/balance';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function evmBalances(accountId: string, { isMinimal = false, chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  try {
    const startUpdateTime = Date.now();

    const addressWithChain = await getFilteredAccountAddresses(accountId, 'evm', { isMinimal, chainId, priority });

    let stored = (await getExtensionLocalStorage(`${accountId}-balance-evm`)) || [];

    const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

    for (const chunk of chunks) {
      const results = await getEVMBalancesForAddresses(accountId, startUpdateTime, chunk);

      stored = upsertEVMBalance(stored, results);

      await browser.storage.local.set<Pick<ExtensionStorage, `${string}-balance-evm`>>({ [`${accountId}-balance-evm`]: stored });

      updateAssets?.();
    }
  } catch (error) {
    devLogger.error(`Failed to process evmBalances for account ${accountId}:`, error);
  }
}

export async function customEvmBalances(accountId: string, { chainId, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  try {
    const startUpdateTime = Date.now();

    const customAccountAddress = await getCustomAccountAddress(accountId);
    const chainMapInstance = await createChainMap('evm');

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

    let stored = (await getExtensionLocalStorage(`${accountId}-custom-balance-evm`)) || [];

    const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

    for (const chunk of chunks) {
      const results = await getEVMBalancesForAddresses(accountId, startUpdateTime, chunk);

      stored = upsertEVMBalance(stored, results);

      await browser.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-evm`>>({ [`${accountId}-custom-balance-evm`]: stored });

      updateAssets?.();
    }
  } catch (error) {
    devLogger.error(`Failed to process customEvmBalances for account ${accountId}:`, error);
  }
}

async function getEVMBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: EvmChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balance = await fetchEVMBalances(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceEvm = { id: accountId, chainId, chainType, address, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceEvm = {
          id: accountId,
          chainId,
          chainType,
          address,
          balance: '0x0',
          lastUpdatedAtMs: startUpdateTime,
          status: 'error',
        };

        return result;
      }
    });

  return results;
}
