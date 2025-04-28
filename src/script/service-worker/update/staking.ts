import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import { getAccount, getAccountAddress } from '@/libs/account';
import { getChains } from '@/libs/chain';
import type {
  AccountAddressCommissionsCosmos,
  AccountAddressDelegationsCosmos,
  AccountAddressDelegationsSui,
  AccountAddressRewardsCosmos,
  AccountAddressUnbondingsCosmos,
} from '@/types/account';
import type { CommissionResponse } from '@/types/cosmos/balance';
import type { DelegationPayload, KavaDelegationPayload, LcdDelegationResponse } from '@/types/cosmos/delegation';
import type { RewardPayload } from '@/types/cosmos/reward';
import type { UnbondingPayload, UnbondingResponses } from '@/types/cosmos/undelegation';
import type { ExtensionStorage } from '@/types/extension';
import type { SuiRpcGetDelegatedStakeResponse } from '@/types/sui/api';
import { convertToValidatorAddress } from '@/utils/cosmos/address';

export async function updateStakingRelatedBalance(id: string) {
  console.time(`update-staking-related-balance-${id}`);
  try {
    await getAccount(id);

    await Promise.all([cosmosStaking(id), suiStaking(id)]);
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

const isKavaPayload = (payload: DelegationPayload | KavaDelegationPayload): payload is KavaDelegationPayload =>
  (payload as KavaDelegationPayload).result?.[0]?.delegation?.delegator_address !== undefined;

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
      const urlPath = `/cosmos/staking/v1beta1/delegations/${address}`;

      const { lcdUrls } = chain;

      let nextKey: string | null = null;

      const responseDelegations: LcdDelegationResponse[][] = [];

      const promises = lcdUrls.map(async (lcdUrl) => {
        const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
        const requestUrl = `${url}${urlPath}`;

        const response = await axios.get<DelegationPayload | KavaDelegationPayload>(requestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
          headers: {
            Cosmostation: `extension/${__APP_VERSION__}`,
          },
        });

        const contentType = response.headers['content-type'] ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
        }

        if (typeof response.data !== 'object' || response.data === null) {
          throw new Error('Invalid response: data is not an object');
        }

        if (isKavaPayload(response.data)) {
          throw Error('no Balance');
        }

        if (response.data.delegation_responses?.length === 0) {
          throw Error('no Balance');
        }

        return response.data;
      });

      try {
        const response = await Promise.any(promises);

        nextKey = response?.pagination?.next_key ?? null;

        responseDelegations.push(response?.delegation_responses ?? []);

        while (nextKey) {
          const nextPromises = lcdUrls.map(async (lcdUrl) => {
            const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
            const requestUrl = `${url}${urlPath}?pagination.key=${nextKey}`;

            const response = await axios.get<DelegationPayload | KavaDelegationPayload>(requestUrl, {
              timeout: BALANCE_FETCH_TIME_OUT_MS,
              headers: {
                Cosmostation: `extension/${__APP_VERSION__}`,
              },
            });

            const contentType = response.headers['content-type'] ?? '';
            if (!contentType.includes('application/json')) {
              throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
            }

            if (typeof response.data !== 'object' || response.data === null) {
              throw new Error('Invalid response: data is not an object');
            }

            if (isKavaPayload(response.data)) {
              throw Error('no Balance');
            }

            if (response.data.delegation_responses?.length === 0) {
              throw Error('no Balance');
            }

            return response.data;
          });

          try {
            const nextResponse = await Promise.any(nextPromises);

            responseDelegations.push(nextResponse?.delegation_responses ?? []);
            nextKey = nextResponse?.pagination?.next_key ?? null;
          } catch {
            nextKey = null;
          }
        }

        const delegations = responseDelegations.flat();

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
      const urlPath = `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;

      const { lcdUrls } = chain;

      let nextKey: string | null = null;

      const responseUnbondings: UnbondingResponses[][] = [];

      const promises = lcdUrls.map(async (lcdUrl) => {
        const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
        const requestUrl = `${url}${urlPath}`;

        const response = await axios.get<UnbondingPayload>(requestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
          headers: {
            Cosmostation: `extension/${__APP_VERSION__}`,
          },
        });

        const contentType = response.headers['content-type'] ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
        }

        if (typeof response.data !== 'object' || response.data === null) {
          throw new Error('Invalid response: data is not an object');
        }

        if (response.data.unbonding_responses?.length === 0) {
          throw Error('no Balance');
        }

        return response.data;
      });

      try {
        const response = await Promise.any(promises);

        nextKey = response?.pagination?.next_key ?? null;

        responseUnbondings.push(response.unbonding_responses ?? []);

        while (nextKey) {
          const nextPromises = lcdUrls.map(async (lcdUrl) => {
            const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
            const requestUrl = `${url}${urlPath}?pagination.key=${nextKey}`;

            const response = await axios.get<UnbondingPayload>(requestUrl, {
              timeout: BALANCE_FETCH_TIME_OUT_MS,
              headers: {
                Cosmostation: `extension/${__APP_VERSION__}`,
              },
            });

            const contentType = response.headers['content-type'] ?? '';
            if (!contentType.includes('application/json')) {
              throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
            }

            if (typeof response.data !== 'object' || response.data === null) {
              throw new Error('Invalid response: data is not an object');
            }

            if (response.data.unbonding_responses?.length === 0) {
              throw Error('no Balance');
            }

            return response.data;
          });

          try {
            const nextResponse = await Promise.any(nextPromises);

            responseUnbondings.push(nextResponse.unbonding_responses ?? []);
            nextKey = nextResponse?.pagination?.next_key ?? null;
          } catch {
            nextKey = null;
          }
        }

        const unbondings = responseUnbondings.flat();

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
      const urlPath = `/cosmos/distribution/v1beta1/delegators/${address}/rewards`;

      const { lcdUrls } = chain;

      const promises = lcdUrls.map(async (lcdUrl) => {
        const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
        const requestUrl = `${url}${urlPath}`;

        const response = await axios.get<RewardPayload>(requestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
          headers: {
            Cosmostation: `extension/${__APP_VERSION__}`,
          },
        });

        const contentType = response.headers['content-type'] ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
        }

        if (typeof response.data !== 'object' || response.data === null) {
          throw new Error('Invalid response: data is not an object');
        }

        return response.data;
      });

      try {
        const response = await Promise.any(promises);

        const rewards = (() => {
          if (response?.result) {
            return { ...response.result };
          }

          if (response?.rewards && response?.total) {
            return { rewards: response.rewards, total: response.total };
          }

          return {
            rewards: [],
            total: [],
          };
        })();

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

      const validatorAddress = convertToValidatorAddress(address, chain.validatorAccountPrefix);

      const urlPath = `/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`;

      const { lcdUrls } = chain;

      const promises = lcdUrls.map(async (lcdUrl) => {
        const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
        const requestUrl = `${url}${urlPath}`;

        const response = await axios.get<CommissionResponse>(requestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
          headers: {
            Cosmostation: `extension/${__APP_VERSION__}`,
          },
        });

        const contentType = response.headers['content-type'] ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
        }

        if (typeof response.data !== 'object' || response.data === null) {
          throw new Error('Invalid response: data is not an object');
        }

        return response.data;
      });

      try {
        const commissions = await Promise.any(promises);

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
