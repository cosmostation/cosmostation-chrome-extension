import axios from 'axios';

import { DEFAULT_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { CommissionResponse } from '@/types/cosmos/balance';
import type { NTRNRewardsResponse } from '@/types/cosmos/contract';
import type { DelegationPayload, KavaDelegationPayload, LcdDelegationResponse } from '@/types/cosmos/delegation';
import type { RewardDetails, RewardPayload } from '@/types/cosmos/reward';
import type { UnbondingPayload, UnbondingResponses } from '@/types/cosmos/undelegation';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { removeTrailingSlash, toBase64 } from '@/utils/string';

const isKavaPayload = (payload: DelegationPayload | KavaDelegationPayload): payload is KavaDelegationPayload =>
  (payload as KavaDelegationPayload).result?.[0]?.delegation?.delegator_address !== undefined;

export const fetchCosmosDelegations = async (address: string, lcdUrls: string[]): Promise<LcdDelegationResponse[]> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    let nextKey: string | null = null;
    const responseDelegations: LcdDelegationResponse[][] = [];

    const base = removeTrailingSlash(lcdUrl);
    const urlPath = `/cosmos/staking/v1beta1/delegations/${address}`;
    const requestUrl = `${base}${urlPath}`;

    const response = await axios.get<DelegationPayload | KavaDelegationPayload>(requestUrl, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
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

    const initialResponse = response.data;

    nextKey = initialResponse?.pagination?.next_key ?? null;
    responseDelegations.push(initialResponse?.delegation_responses ?? []);

    while (nextKey) {
      try {
        const paginatedRequestUrl = `${requestUrl}&pagination.key=${nextKey}`;

        const paginatedResponse = await axios.get<DelegationPayload | KavaDelegationPayload>(paginatedRequestUrl, {
          timeout: DEFAULT_FETCH_TIME_OUT_MS,
          headers: {
            Cosmostation: `extension/${__APP_VERSION__}`,
          },
        });

        const contentType = paginatedResponse.headers['content-type'] ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
        }

        if (typeof paginatedResponse.data !== 'object' || paginatedResponse.data === null) {
          throw new Error('Invalid response: data is not an object');
        }

        if (isKavaPayload(paginatedResponse.data)) {
          throw Error('no Balance');
        }

        if (paginatedResponse.data.delegation_responses?.length === 0) {
          throw Error('no Balance');
        }

        const paginatedData = paginatedResponse.data;

        responseDelegations.push(paginatedData?.delegation_responses ?? []);
        nextKey = paginatedData?.pagination?.next_key ?? null;
      } catch {
        nextKey = null;
      }
    }

    const delegations = responseDelegations.flat();

    return delegations;
  });
};

export const fetchCosmosUnbondings = async (address: string, lcdUrls: string[]): Promise<UnbondingResponses[]> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    let nextKey: string | null = null;
    const responseUnbondings: UnbondingResponses[][] = [];

    const base = removeTrailingSlash(lcdUrl);
    const urlPath = `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
    const requestUrl = `${base}${urlPath}`;

    const response = await axios.get<UnbondingPayload>(requestUrl, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
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

    const initialResponse = response.data;

    nextKey = initialResponse?.pagination?.next_key ?? null;
    responseUnbondings.push(initialResponse?.unbonding_responses ?? []);

    while (nextKey) {
      try {
        const paginatedRequestUrl = `${requestUrl}&pagination.key=${nextKey}`;

        const paginatedResponse = await axios.get<UnbondingPayload>(paginatedRequestUrl, {
          timeout: DEFAULT_FETCH_TIME_OUT_MS,
          headers: {
            Cosmostation: `extension/${__APP_VERSION__}`,
          },
        });

        const contentType = paginatedResponse.headers['content-type'] ?? '';
        if (!contentType.includes('application/json')) {
          throw new Error(`Invalid response: not JSON (content-type: ${contentType})`);
        }

        if (typeof paginatedResponse.data !== 'object' || paginatedResponse.data === null) {
          throw new Error('Invalid response: data is not an object');
        }

        if (paginatedResponse.data.unbonding_responses?.length === 0) {
          throw Error('no Balance');
        }

        const paginatedData = paginatedResponse.data;

        responseUnbondings.push(paginatedData.unbonding_responses ?? []);
        nextKey = paginatedData?.pagination?.next_key ?? null;
      } catch {
        nextKey = null;
      }
    }

    const unbondings = responseUnbondings.flat();

    return unbondings;
  });
};

export const fetchCosmosRewards = async (address: string, lcdUrls: string[]): Promise<RewardDetails> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    const base = removeTrailingSlash(lcdUrl);
    const urlPath = `/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
    const requestUrl = `${base}${urlPath}`;

    const response = await axios.get<RewardPayload>(requestUrl, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
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

    const initialResponse = response.data;

    const rewards = (() => {
      if (initialResponse?.result) {
        return { ...initialResponse.result };
      }

      if (initialResponse?.rewards && initialResponse?.total) {
        return { rewards: initialResponse.rewards, total: initialResponse.total };
      }

      return {
        rewards: [],
        total: [],
      };
    })();

    return rewards;
  });
};

export const fetchNTRNRewards = async (address: string, rewardContractAddress: string, lcdUrls: string[]): Promise<RewardDetails> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    const base = removeTrailingSlash(lcdUrl);
    const urlPath = `/cosmwasm/wasm/v1/contract/${rewardContractAddress}/smart/${toBase64(`{"rewards":{"user":"${address}"}}`)}`;
    const requestUrl = `${base}${urlPath}`;

    const response = await axios.get<NTRNRewardsResponse>(requestUrl, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
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

    const responseData = response.data;

    const rewards = (() => {
      return {
        rewards: [],
        total: [responseData.data.pending_rewards],
      };
    })();

    return rewards;
  });
};

export const fetchCosmosCommission = async (validatorAddress: string, lcdUrls: string[]): Promise<CommissionResponse> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    const base = removeTrailingSlash(lcdUrl);
    const urlPath = `/cosmos/distribution/v1beta1/validators/${validatorAddress}/commission`;
    const requestUrl = `${base}${urlPath}`;

    const response = await axios.get<CommissionResponse>(requestUrl, {
      timeout: DEFAULT_FETCH_TIME_OUT_MS,
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
};
