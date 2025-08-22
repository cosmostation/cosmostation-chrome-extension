import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NEUTRON_STAKE_CONTRACT_ADDRESS, NEUTRON_TESTNET_STAKE_CONTRACT_ADDRESS } from '@/constants/cosmos/contract';
import { getAccount, getAccountAddress } from '@/libs/account';
import { getChains } from '@/libs/chain';
import type {
  AccountAddressCommissionsCosmos,
  AccountAddressDelegationsCosmos,
  AccountAddressDelegationsIota,
  AccountAddressDelegationsSui,
  AccountAddressRewardsCosmos,
  AccountAddressUnbondingsCosmos,
} from '@/types/account';
import type { UniqueChainId } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import {
  upsertCosmosCommission,
  upsertCosmosDelegation,
  upsertCosmosReward,
  upsertCosmosUndelegation,
  upsertIotaDelegation,
  upsertSuiDelegation,
} from '@/utils/balanceUpsert';
import { convertToValidatorAddress, isValidatorAddress } from '@/utils/cosmos/address';
import { fetchCosmosCommission, fetchCosmosDelegations, fetchCosmosRewards, fetchCosmosUnbondings, fetchNTRNRewards } from '@/utils/cosmos/fetch/staking';
import { fetchIotaDelegations } from '@/utils/iota/fetch/staking';
import { getUniqueChainIdWithManual, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { fetchSuiDelegations } from '@/utils/sui/fetch/staking';

import type { BalanceFetchOption } from './balance';

export async function updateStakingRelatedBalance(id: string) {
  console.time(`update-staking-related-balance-${id}`);
  try {
    await getAccount(id);

    await Promise.all([cosmosStaking(id), suiStaking(id), iotaStaking(id)]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`update-staking-related-balance-${id}`);
  }
}

export async function updateSpecificChainStaking(id: string, chainId: UniqueChainId) {
  console.time(`chain-staking-balance-${id}-${chainId}`);
  try {
    await getAccount(id);

    await fetchStakingByChainType(id, chainId);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`chain-staking-balance-${id}-${chainId}`);
  }
}

async function fetchStakingByChainType(id: string, chainId: UniqueChainId) {
  const { chainType } = parseUniqueChainId(chainId);

  if (chainType === 'cosmos') {
    await cosmosStaking(id, { chainId });
  }

  if (chainType === 'sui') {
    await suiStaking(id, { chainId });
  }

  if (chainType === 'iota') {
    await iotaStaking(id, { chainId });
  }
}

async function cosmosStaking(id: string, { chainId }: BalanceFetchOption = {}) {
  await Promise.all([
    cosmosDelegations(id, { chainId }),
    cosmosUnbondings(id, { chainId }),
    cosmosRewards(id, { chainId }),
    cosmosCommissions(id, { chainId }),
  ]);
}

async function cosmosDelegations(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);

  const targetChain = chainId && stakingEnabledChain.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        const delegations = await fetchCosmosDelegations(address, lcdUrls.map((item) => item.url).filter(Boolean));
        const result: AccountAddressDelegationsCosmos = {
          id,
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
          id,
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

  const storage = (await getExtensionLocalStorage(`${id}-delegation-cosmos`)) || [];

  const updatedCosmosDelegations = upsertCosmosDelegation(storage, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-cosmos`>>({ [`${id}-delegation-cosmos`]: updatedCosmosDelegations });
}

async function cosmosUnbondings(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);

  const targetChain = chainId && stakingEnabledChain.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { lcdUrls } = chain;

      try {
        const unbondings = await fetchCosmosUnbondings(address, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressUnbondingsCosmos = {
          id,
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
          id,
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

  const stored = (await getExtensionLocalStorage(`${id}-undelegation-cosmos`)) || [];

  const updatedCosmosUndelegations = upsertCosmosUndelegation(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-undelegation-cosmos`>>({ [`${id}-undelegation-cosmos`]: updatedCosmosUndelegations });
}

async function cosmosRewards(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);

  const targetChain = chainId && stakingEnabledChain.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
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
          id,
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
          id,
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

  const stored = (await getExtensionLocalStorage(`${id}-reward-cosmos`)) || [];

  const updatedCosmosRewards = upsertCosmosReward(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-reward-cosmos`>>({ [`${id}-reward-cosmos`]: updatedCosmosRewards });
}

const validatorAddressCache = new Map<string, boolean>();

async function isValidatorCached(address: string, lcdUrl: string, validatorPrefix?: string): Promise<boolean> {
  if (validatorAddressCache.has(address)) {
    return validatorAddressCache.get(address)!;
  }

  const validatorAddress = convertToValidatorAddress(address, validatorPrefix);

  const isValidator = validatorAddress ? await isValidatorAddress(validatorAddress, lcdUrl) : false;

  validatorAddressCache.set(address, isValidator);
  return isValidator;
}

async function cosmosCommissions(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);

  const targetChain = chainId && stakingEnabledChain.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { lcdUrls } = chain;

      try {
        const shouldFetchCommission = await isValidatorCached(address, lcdUrls[0].url, chain.validatorAccountPrefix);
        if (!shouldFetchCommission) {
          throw new Error('Not a validator account');
        }

        const validatorAddress = convertToValidatorAddress(address, chain.validatorAccountPrefix);

        if (!validatorAddress) {
          throw new Error('No validator address');
        }

        const commissions = await fetchCosmosCommission(validatorAddress, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressCommissionsCosmos = {
          id,
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
          id,
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

  const stored = (await getExtensionLocalStorage(`${id}-commission-cosmos`)) || [];

  const updatedCosmosCommission = upsertCosmosCommission(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-commission-cosmos`>>({ [`${id}-commission-cosmos`]: updatedCosmosCommission });
}

async function suiStaking(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { suiChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = suiChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const response = await fetchSuiDelegations(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const delegations = response ?? [];

        const result: AccountAddressDelegationsSui = { id, chainId, chainType, address, delegations, lastUpdatedAtMs: startUpdateTime };

        return result;
      } catch {
        const result: AccountAddressDelegationsSui = { id, chainId, chainType, address, delegations: [], lastUpdatedAtMs: startUpdateTime };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-delegation-sui`)) || [];

  const updatedSuiDelegations = upsertSuiDelegation(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-sui`>>({ [`${id}-delegation-sui`]: updatedSuiDelegations });
}

async function iotaStaking(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { iotaChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = iotaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const response = await fetchIotaDelegations(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const delegations = response ?? [];

        const result: AccountAddressDelegationsIota = { id, chainId, chainType, address, delegations, lastUpdatedAtMs: startUpdateTime };

        return result;
      } catch {
        const result: AccountAddressDelegationsIota = { id, chainId, chainType, address, delegations: [], lastUpdatedAtMs: startUpdateTime };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-delegation-iota`)) || [];

  const updatedIotaDelegations = upsertIotaDelegation(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-iota`>>({ [`${id}-delegation-iota`]: updatedIotaDelegations });
}
