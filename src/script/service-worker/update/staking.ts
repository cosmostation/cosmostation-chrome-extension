import axios from 'axios';

import { getAccount } from '@/libs/account';
import type { UniqueChainId } from '@/types/chain';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { parseUniqueChainId } from '@/utils/queryParamGenerator';

import { cosmosCommissions, cosmosDelegations, cosmosRewards, cosmosUnbondings } from './balance/cosmos/staking';
import { iotaStaking } from './balance/iota/staking';
import { suiStaking } from './balance/sui/staking';

export async function updateStakingRelatedBalance(id: string) {
  console.time(`update-staking-related-balance-${id}`);
  try {
    await getAccount(id);

    await Promise.all([cosmosStaking(id), suiStaking(id), iotaStaking(id)]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
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
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`chain-staking-balance-${id}-${chainId}`);
  }
}

export async function updatePriorityChainStaking(id: string, priority: 'high' | 'low', updateAssets: () => void) {
  console.time(`update-${priority}-priority-staking-related-balance-${id}`);
  try {
    await getAccount(id);

    const chunkSize = priority === 'high' ? 10 : 40;
    const optionUpdatePerChunk = { priority, updateAssets, chunkSize };
    const optionUpdateAfterAll = { priority, chunkSize };

    await Promise.all([
      cosmosStaking(id, optionUpdatePerChunk),

      Promise.all([suiStaking(id, optionUpdateAfterAll), iotaStaking(id, optionUpdateAfterAll)]).then(() => updateAssets()),
    ]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`update-${priority}-priority-staking-related-balance-${id}`);
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

async function cosmosStaking(id: string, option: BalanceFetchOption = {}) {
  await Promise.all([cosmosDelegations(id, option), cosmosUnbondings(id, option), cosmosRewards(id, option), cosmosCommissions(id, option)]);
}
