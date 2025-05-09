import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
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
import type { ExtensionStorage } from '@/types/extension';
import type { SuiRpcGetDelegatedStakeResponse } from '@/types/sui/api';
import { convertToValidatorAddress, isValidatorAddress } from '@/utils/cosmos/address';
import { fetchCosmosCommission, fetchCosmosDelegations, fetchCosmosRewards, fetchCosmosUnbondings, fetchNTRNRewards } from '@/utils/cosmos/fetch/staking';
import { fetchIotaDelegations } from '@/utils/iota/fetch/staking';

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

async function cosmosStaking(id: string) {
  await Promise.all([cosmosDelegations(id), cosmosUnbondings(id), cosmosRewards(id), cosmosCommissions(id)]);
}

async function cosmosDelegations(id: string) {
  const address = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const addressList = address;

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

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-cosmos`>>({ [`${id}-delegation-cosmos`]: results });
}

async function cosmosUnbondings(id: string) {
  const address = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const addressList = address;

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

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-undelegation-cosmos`>>({ [`${id}-undelegation-cosmos`]: results });
}

async function cosmosRewards(id: string) {
  const address = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const addressList = address;

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

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-reward-cosmos`>>({ [`${id}-reward-cosmos`]: results });
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

async function cosmosCommissions(id: string) {
  const address = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const addressList = address;

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

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-commission-cosmos`>>({ [`${id}-commission-cosmos`]: results });
}

async function suiStaking(id: string) {
  const address = await getAccountAddress(id);
  const { suiChains } = await getChains();

  const addressWithChain = address
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

      const body = {
        jsonrpc: '2.0',
        method: 'suix_getStakes',
        params: [address],
        id: 1,
      };

      const promises = rpcUrls.map(async (rpcUrl) => {
        const url = rpcUrl.url;

        const response = await axios.post<SuiRpcGetDelegatedStakeResponse>(url, body, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        if (response.data.error) {
          throw new Error(`[RPC Error] URL: ${url}, Method: ${body.method}, Message: ${response.data.error?.message}`);
        }

        return response.data;
      });

      const response = await Promise.any(promises);

      const delegations = response?.result ?? [];

      const result: AccountAddressDelegationsSui = { id, chainId, chainType, address, delegations };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-sui`>>({ [`${id}-delegation-sui`]: results });
}

async function iotaStaking(id: string) {
  const address = await getAccountAddress(id);
  const { iotaChains } = await getChains();

  const addressWithChain = address
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

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-delegation-iota`>>({ [`${id}-delegation-iota`]: results });
}
