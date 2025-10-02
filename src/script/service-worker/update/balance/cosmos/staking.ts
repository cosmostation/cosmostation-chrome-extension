import PromisePool from '@supercharge/promise-pool';

import { NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NEUTRON_STAKE_CONTRACT_ADDRESS, NEUTRON_TESTNET_STAKE_CONTRACT_ADDRESS } from '@/constants/cosmos/contract';
import { getAccountAddress } from '@/libs/account';
import type {
  AccountAddress,
  AccountAddressCommissionsCosmos,
  AccountAddressDelegationsCosmos,
  AccountAddressRewardsCosmos,
  AccountAddressUnbondingsCosmos,
} from '@/types/account';
import type { CosmosChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertCosmosCommission, upsertCosmosDelegation, upsertCosmosReward, upsertCosmosUndelegation } from '@/utils/balanceUpsert';
import { createStakingSupportCosmosChainMap } from '@/utils/cache/chainMap';
import { isValidatorCached } from '@/utils/cache/cosmos/validator';
import { convertToValidatorAddress } from '@/utils/cosmos/address';
import { fetchCosmosCommission, fetchCosmosDelegations, fetchCosmosRewards, fetchCosmosUnbondings, fetchNTRNRewards } from '@/utils/cosmos/fetch/staking';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getChainIdsByBalancePriority } from '../address';

export async function cosmosDelegations(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredCosmosStakingAccountAddresses(accountId, { chainId, priority });

  let stored = (await getExtensionLocalStorage(`${accountId}-delegation-cosmos`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getCosmosDelegationsForAddresses(accountId, startUpdateTime, chunk);

    stored = upsertCosmosDelegation(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-cosmos`>>({ [`${accountId}-delegation-cosmos`]: stored });

    updateAssets?.();
  }
}

export async function cosmosUnbondings(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredCosmosStakingAccountAddresses(accountId, { chainId, priority });

  let stored = (await getExtensionLocalStorage(`${accountId}-undelegation-cosmos`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getCosmosUnbondingsForAddresses(accountId, startUpdateTime, chunk);
    stored = upsertCosmosUndelegation(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-undelegation-cosmos`>>({ [`${accountId}-undelegation-cosmos`]: stored });

    updateAssets?.();
  }
}

export async function cosmosRewards(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredCosmosStakingAccountAddresses(accountId, { chainId, priority });

  let stored = (await getExtensionLocalStorage(`${accountId}-reward-cosmos`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getCosmosRewardsForAddresses(accountId, startUpdateTime, chunk);

    stored = upsertCosmosReward(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-reward-cosmos`>>({ [`${accountId}-reward-cosmos`]: stored });

    updateAssets?.();
  }
}

export async function getFilteredCosmosStakingAccountAddresses(id: string, { chainId, priority }: BalanceFetchOption = {}) {
  const [accountAddress, chainMapInstance] = await Promise.all([getAccountAddress(id), createStakingSupportCosmosChainMap()]);

  if (priority) {
    const filteredChainIds = await getChainIdsByBalancePriority(id, 'cosmos', priority);

    return accountAddress
      .map((address) => {
        const uniqueId = getUniqueChainIdWithManual(address.chainId, address.chainType);

        if (filteredChainIds?.has(uniqueId)) {
          const chain = chainMapInstance?.get(uniqueId);
          return chain ? { ...address, chain } : null;
        }
        return null;
      })
      .filter((item) => !!item);
  }

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && chainMapInstance?.get(chainId);

  return addressList
    .map((addr) => {
      const chain = targetChain || chainMapInstance?.get(getUniqueChainIdWithManual(addr.chainId, addr.chainType));
      return chain ? { ...addr, chain } : null;
    })
    .filter((item) => !!item);
}

export async function cosmosCommissions(accountId: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const addressWithChain = await getFilteredCosmosStakingAccountAddresses(accountId, { chainId, priority });

  let stored = (await getExtensionLocalStorage(`${accountId}-commission-cosmos`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const results = await getCosmosCommissionsForAddresses(accountId, startUpdateTime, chunk);

    stored = upsertCosmosCommission(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-commission-cosmos`>>({ [`${accountId}-commission-cosmos`]: stored });

    updateAssets?.();
  }
}

async function getCosmosDelegationsForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: CosmosChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        const delegations = await fetchCosmosDelegations(address, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressDelegationsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          delegations,
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      } catch {
        const result: AccountAddressDelegationsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          delegations: [],
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      }
    });

  return results;
}

async function getCosmosUnbondingsForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: CosmosChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { lcdUrls } = chain;

      try {
        const unbondings = await fetchCosmosUnbondings(address, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressUnbondingsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          unbondings,
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      } catch {
        const result: AccountAddressUnbondingsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          unbondings: [],
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      }
    });

  return results;
}

async function getCosmosRewardsForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: CosmosChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        const getRewards = async () => {
          const isNeutronChain = [NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID].includes(chainId);

          const lcdUrlList = lcdUrls.map((item) => item.url).filter(Boolean);

          if (isNeutronChain) {
            const contractAddress = chainId === NEUTRON_CHAINLIST_ID ? NEUTRON_STAKE_CONTRACT_ADDRESS : NEUTRON_TESTNET_STAKE_CONTRACT_ADDRESS;

            return fetchNTRNRewards(address, contractAddress, lcdUrlList);
          }

          return fetchCosmosRewards(address, lcdUrlList);
        };

        const rewards = await getRewards();
        const result: AccountAddressRewardsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          rewards,
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      } catch {
        const result: AccountAddressRewardsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          rewards: {
            rewards: [],
            total: [],
          },
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      }
    });

  return results;
}

async function getCosmosCommissionsForAddresses(accountId: string, startUpdateTime: number, addressesWithChain: (AccountAddress & { chain: CosmosChain })[]) {
  const { results } = await PromisePool.withConcurrency(5)
    .for(addressesWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { lcdUrls } = chain;

      try {
        const shouldFetchCommission = lcdUrls.length > 0 && (await isValidatorCached(address, lcdUrls[0].url, chain.validatorAccountPrefix));
        if (!shouldFetchCommission) {
          throw new Error('Not a validator account');
        }

        const validatorAddress = convertToValidatorAddress(address, chain.validatorAccountPrefix);

        if (!validatorAddress) {
          throw new Error('No validator address');
        }

        const commissions = await fetchCosmosCommission(validatorAddress, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressCommissionsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          commissions,
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      } catch {
        const result: AccountAddressCommissionsCosmos = {
          id: accountId,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          commissions: undefined,
          lastUpdatedAtMs: startUpdateTime,
        };

        return result;
      }
    });

  return results;
}
