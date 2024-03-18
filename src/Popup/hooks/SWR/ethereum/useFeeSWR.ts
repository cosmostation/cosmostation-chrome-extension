import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { SMART_CHAIN } from '~/constants/chain/ethereum/network/smartChain';
import { GAS_SETTINGS_BY_PRIORITY_LEVEL, PRIORITY_LEVEL } from '~/constants/ethereum';
import { gt, medianOf, plus, times } from '~/Popup/utils/big';
import type { FeeType, GasEstimates } from '~/types/ethereum/common';

import { useFeeHistorySWR } from './useFeeHistorySWR';
import { useGasPriceSWR } from './useGasPriceSWR';
import { useGetBlockByNumberSWR } from './useGetBlockByNumberSWR';
import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

export function useFeeSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const block = useGetBlockByNumberSWR(['latest', false], config);
  const feeHistory = useFeeHistorySWR([5, 'latest', [10, 20, 30]], config);
  const gasPrice = useGasPriceSWR(config);

  const currentGasPrice = gasPrice.data?.result ? plus(parseInt(gasPrice.data.result, 16), '1000') : null;

  const currentFee = useMemo(() => {
    if (!feeHistory.data?.result || !block.data?.result?.baseFeePerGas) {
      return null;
    }

    const baseFeePerGas = plus(parseInt(block.data.result.baseFeePerGas, 16), '1000');

    const originReward = feeHistory.data.result.reward || [];

    const transposedRewards = originReward.reduce<string[][]>((result, row) => row.map((_, i) => [...(result[i] || []), row[i].toString()]), []);

    const medianRewards = transposedRewards.map((item) => medianOf(item.map((reward) => parseInt(reward, 16))));

    const priorityLevels = Object.values(PRIORITY_LEVEL);

    const rewardsWithLevels = medianRewards.map((reward, i) => ({ reward, level: priorityLevels[i] }));

    return rewardsWithLevels.reduce((acc: GasEstimates, { reward, level }) => {
      const { minMaxPriorityFeePerGas, priorityFeePercentageMultiplier, baseFeePercentageMultiplier } = GAS_SETTINGS_BY_PRIORITY_LEVEL[level];

      const multipliedPriorityFee = times(reward, priorityFeePercentageMultiplier, 0);
      const maxPriorityFeePerGas = gt(multipliedPriorityFee, minMaxPriorityFeePerGas) ? multipliedPriorityFee : minMaxPriorityFeePerGas;

      const maxBaseFeePerGas = plus(times(baseFeePerGas, baseFeePercentageMultiplier, 0), maxPriorityFeePerGas);

      return {
        ...acc,
        [level]: {
          maxBaseFeePerGas,
          maxPriorityFeePerGas,
        },
      };
    }, {} as GasEstimates);
  }, [feeHistory, block]);

  const type: FeeType | null = (() => {
    if (!currentFee && !currentGasPrice) {
      return null;
    }

    const basicFeeOnlyChainIds = [SMART_CHAIN.id];

    if (basicFeeOnlyChainIds.includes(currentEthereumNetwork.id)) {
      return 'BASIC';
    }

    return currentFee ? 'EIP-1559' : 'BASIC';
  })();

  const mutate = useCallback(async () => {
    await block.mutate();
    await feeHistory.mutate();
    await gasPrice.mutate();
  }, [block, feeHistory, gasPrice]);

  const returnData = useMemo(
    () => ({
      type,
      currentGasPrice,
      currentFee,
      mutate,
    }),
    [currentFee, currentGasPrice, mutate, type],
  );

  return returnData;
}
