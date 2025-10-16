import axios from 'axios';
import PromisePool from '@supercharge/promise-pool';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { AccountAddress, AccountAddressBalanceBitcoin } from '@/types/account';
import type { AccountDetail } from '@/types/bitcoin/balance';
import type { BitcoinChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertBitcoinBalance } from '@/utils/balanceUpsert';
import { devLogger } from '@/utils/devLogger';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getFilteredAccountAddresses } from '../address';

export async function bitcoinBalances(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  try {
    const startUpdateTime = Date.now();

    const addressWithChain = await getFilteredAccountAddresses(accountId, 'bitcoin', { chainId, priority });

    let stored = (await getExtensionLocalStorage(`${accountId}-balance-bitcoin`)) || [];

    const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

    for (const chunk of chunks) {
      const results = await getBitcoinBalancesForAddresses(accountId, startUpdateTime, chunk);

      stored = upsertBitcoinBalance(stored, results);

      await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-bitcoin`>>({ [`${accountId}-balance-bitcoin`]: stored });

      updateAssets?.();
    }
  } catch (error) {
    devLogger.error(`Failed to process bitcoinBalances for account ${accountId}:`, error);
  }
}

async function getBitcoinBalancesForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: BitcoinChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { mempoolURL } = chain;

      const url = `${mempoolURL}/address/${address}`;

      try {
        const response = await axios.get<AccountDetail>(url, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        const balance = {
          chainStats: response.data?.chain_stats || undefined,
          mempoolStats: response.data?.mempool_stats || undefined,
        };

        const result: AccountAddressBalanceBitcoin = {
          id: accountId,
          chainId,
          chainType,
          address,
          balance,
          lastUpdatedAtMs: startUpdateTime,
          status: 'success',
        };

        return result;
      } catch {
        const result: AccountAddressBalanceBitcoin = {
          id: accountId,
          chainId,
          chainType,
          address,
          balance: {
            chainStats: undefined,
            mempoolStats: undefined,
          },
          lastUpdatedAtMs: startUpdateTime,
          status: 'error',
        };

        return result;
      }
    });

  return results;
}
