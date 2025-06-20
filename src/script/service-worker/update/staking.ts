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
import { upsertList } from '@/utils/array';
import { convertToValidatorAddress, isValidatorAddress } from '@/utils/cosmos/address';
import { fetchCosmosCommission, fetchCosmosDelegations, fetchCosmosRewards, fetchCosmosUnbondings, fetchNTRNRewards } from '@/utils/cosmos/fetch/staking';
import { fetchIotaDelegations } from '@/utils/iota/fetch/staking';
import { getUniqueChainIdWithManual, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';
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

export async function updateSpecificChainStaking(id: string, chainId: UniqueChainId, address: string) {
  console.time(`chain-staking-balance-${id}-${chainId}-${address}`);
  try {
    await getAccount(id);

    await fetchStakingByChainType(id, chainId, address);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`chain-staking-balance-${id}-${chainId}-${address}`);
  }
}

async function fetchStakingByChainType(id: string, chainId: UniqueChainId, address: string) {
  const { chainType } = parseUniqueChainId(chainId);

  if (chainType === 'cosmos') {
    await cosmosStaking(id, { chainId, address });
  }

  if (chainType === 'sui') {
    await suiStaking(id, { chainId, address });
  }

  if (chainType === 'iota') {
    await iotaStaking(id, { chainId, address });
  }
}

async function cosmosStaking(id: string, { address, chainId }: BalanceFetchOption = {}) {
  await Promise.all([
    cosmosDelegations(id, { chainId, address }),
    cosmosUnbondings(id, { chainId, address }),
    cosmosRewards(id, { chainId, address }),
    cosmosCommissions(id, { chainId, address }),
  ]);
}

interface UpsertItemBase {
  address: string;
  chainId: string | number;
  chainType: string;
  id: string;
}

interface UpsertItemWithAssetId extends UpsertItemBase {
  assetId: string;
}

const isSameUpsertItemWithAssetId = (a: UpsertItemWithAssetId, b: UpsertItemWithAssetId) =>
  isEqualsIgnoringCase(a.address, b.address) && a.chainId === b.chainId && a.chainType === b.chainType && a.assetId === b.assetId && a.id === b.id;

const isSameUpsertItemWithoutAssetId = (a: UpsertItemBase, b: UpsertItemBase) =>
  isEqualsIgnoringCase(a.address, b.address) && a.chainId === b.chainId && a.chainType === b.chainType && a.id === b.id;

async function cosmosDelegations(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);
  const addressWithChain = addressList
    .map((addr) => {
      const chain = stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        const delegations = await fetchCosmosDelegations(address, lcdUrls.map((item) => item.url).filter(Boolean));
        const result: AccountAddressDelegationsCosmos = { id, assetId: chain.mainAssetDenom, chainId, chainType, address, delegations };

        return result;
      } catch {
        const result: AccountAddressDelegationsCosmos = { id, assetId: chain.mainAssetDenom, chainId, chainType, address, delegations: [] };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-delegation-cosmos`]);

    const storedCosmosDelegations = storage[`${id}-delegation-cosmos`] || [];

    const updatedCosmosDelegations = upsertList(storedCosmosDelegations, results, isSameUpsertItemWithAssetId, (e, i) => (e.delegations = i.delegations));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-cosmos`>>({ [`${id}-delegation-cosmos`]: updatedCosmosDelegations });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-cosmos`>>({ [`${id}-delegation-cosmos`]: results });
  }
}

async function cosmosUnbondings(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);
  const addressWithChain = addressList
    .map((addr) => {
      const chain = stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { lcdUrls } = chain;

      try {
        const unbondings = await fetchCosmosUnbondings(address, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressUnbondingsCosmos = { id, assetId: chain.mainAssetDenom, chainId, chainType, address, unbondings };

        return result;
      } catch {
        const result: AccountAddressUnbondingsCosmos = { id, assetId: chain.mainAssetDenom, chainId, chainType, address, unbondings: [] };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-undelegation-cosmos`]);

    const storedCosmosUndelegations = storage[`${id}-undelegation-cosmos`] || [];

    const updatedCosmosUndelegations = upsertList(storedCosmosUndelegations, results, isSameUpsertItemWithAssetId, (e, i) => (e.unbondings = i.unbondings));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-undelegation-cosmos`>>({ [`${id}-undelegation-cosmos`]: updatedCosmosUndelegations });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-undelegation-cosmos`>>({ [`${id}-undelegation-cosmos`]: results });
  }
}

async function cosmosRewards(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);
  const addressWithChain = addressList
    .map((addr) => {
      const chain = stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
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
        const result: AccountAddressRewardsCosmos = { id, assetId: chain.mainAssetDenom, chainId, chainType, address, rewards };

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
        };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-reward-cosmos`]);

    const storedCosmosRewards = storage[`${id}-reward-cosmos`] || [];

    const updatedCosmosRewards = upsertList(storedCosmosRewards, results, isSameUpsertItemWithAssetId, (e, i) => (e.rewards = i.rewards));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-reward-cosmos`>>({ [`${id}-reward-cosmos`]: updatedCosmosRewards });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-reward-cosmos`>>({ [`${id}-reward-cosmos`]: results });
  }
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

async function cosmosCommissions(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const stakingEnabledChain = cosmosChains.filter((chain) => chain.isSupportStaking);
  const addressWithChain = addressList
    .map((addr) => {
      const chain = stakingEnabledChain.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
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

        const result: AccountAddressCommissionsCosmos = { id, assetId: chain.mainAssetDenom, chainId, chainType, address, commissions };

        return result;
      } catch {
        const result: AccountAddressCommissionsCosmos = {
          id,
          assetId: chain.mainAssetDenom,
          chainId,
          chainType,
          address,
          commissions: undefined,
        };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-commission-cosmos`]);

    const storedCosmosCommission = storage[`${id}-commission-cosmos`] || [];

    const updatedCosmosCommission = upsertList(storedCosmosCommission, results, isSameUpsertItemWithAssetId, (e, i) => (e.commissions = i.commissions));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-commission-cosmos`>>({ [`${id}-commission-cosmos`]: updatedCosmosCommission });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-commission-cosmos`>>({ [`${id}-commission-cosmos`]: results });
  }
}

async function suiStaking(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { suiChains } = await getChains();

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = suiChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      const response = await fetchSuiDelegations(address, rpcUrls.map((item) => item.url).filter(Boolean));

      const delegations = response ?? [];

      const result: AccountAddressDelegationsSui = { id, chainId, chainType, address, delegations };

      return result;
    });

  if (isUpdateSpecificAddress) {
    const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-delegation-sui`]);

    const storedSuiDelegations = storage[`${id}-delegation-sui`] || [];

    const updatedSuiDelegations = upsertList(storedSuiDelegations, results, isSameUpsertItemWithoutAssetId, (e, i) => (e.delegations = i.delegations));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-sui`>>({ [`${id}-delegation-sui`]: updatedSuiDelegations });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-sui`>>({ [`${id}-delegation-sui`]: results });
  }
}

async function iotaStaking(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { iotaChains } = await getChains();

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = iotaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      const response = await fetchIotaDelegations(address, rpcUrls.map((item) => item.url).filter(Boolean));

      const delegations = response ?? [];

      const result: AccountAddressDelegationsIota = { id, chainId, chainType, address, delegations };

      return result;
    });

  if (isUpdateSpecificAddress) {
    const storage = await chrome.storage.local.get<ExtensionStorage>([`${id}-delegation-iota`]);

    const storedIotaDelegations = storage[`${id}-delegation-iota`] || [];

    const updatedIotaDelegations = upsertList(storedIotaDelegations, results, isSameUpsertItemWithoutAssetId, (e, i) => (e.delegations = i.delegations));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-iota`>>({ [`${id}-delegation-iota`]: updatedIotaDelegations });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-iota`>>({ [`${id}-delegation-iota`]: results });
  }
}
