import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { gt, medianOf, plus, times } from '~/Popup/utils/big';
import type { FeeType } from '~/types/ethereum/common';

import { useFeeHistorySWR } from './useFeeHistorySWR';
import { useGasPriceSWR } from './useGasPriceSWR';
import { useGetBlockByNumberSWR } from './useGetBlockByNumberSWR';
import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

const SETTINGS_BY_PRIORITY_LEVEL = {
  tiny: {
    baseFeePercentageMultiplier: 1.1,
    priorityFeePercentageMultiplier: 0.94,
    minMaxPriorityFeePerGas: '1000000000',
  },
  low: {
    baseFeePercentageMultiplier: 1.2,
    priorityFeePercentageMultiplier: 0.97,
    minMaxPriorityFeePerGas: '1500000000',
  },
  average: {
    baseFeePercentageMultiplier: 1.25,
    priorityFeePercentageMultiplier: 0.98,
    minMaxPriorityFeePerGas: '2000000000',
  },
};
type GasFeeConfiguration = {
  maxBaseFeePerGas: string;
  maxPriorityFeePerGas: string;
};

type GasFeeEstimates = {
  tiny: GasFeeConfiguration;
  low: GasFeeConfiguration;
  average: GasFeeConfiguration;
};

export function useFeeSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const block = useGetBlockByNumberSWR(['pending', false], config);
  const feeHistory = useFeeHistorySWR([5, 'pending', [10, 20, 30]], config);
  const gasPrice = useGasPriceSWR(config);

  const currentGasPrice = gasPrice.data?.result ? plus(parseInt(gasPrice.data.result, 16), '1000') : null;

  const currentFee = useMemo(() => {
    if (!feeHistory.data?.result || !block.data?.result?.baseFeePerGas) {
      return null;
    }

    const baseFeePerGas = parseInt(block.data.result.baseFeePerGas, 16);

    const originReward = feeHistory.data.result.reward || [];

    const transposedRewards = originReward.reduce<string[][]>((result, row) => row.map((_, i) => [...(result[i] || []), row[i].toString()]), []);

    const medianRewards = transposedRewards.map((item) => medianOf(item.map((reward) => parseInt(reward, 16))));

    return medianRewards.reduce((acc: GasFeeEstimates, item, i) => {
      if (i === 0) {
        const { minMaxPriorityFeePerGas, priorityFeePercentageMultiplier, baseFeePercentageMultiplier } = SETTINGS_BY_PRIORITY_LEVEL.tiny;

        const feeWithPriorityMultiplier = times(item, priorityFeePercentageMultiplier);
        const maxPriorityFeePerGas = gt(feeWithPriorityMultiplier, minMaxPriorityFeePerGas) ? feeWithPriorityMultiplier : minMaxPriorityFeePerGas;

        const maxBaseFeePerGas = plus(times(baseFeePerGas, baseFeePercentageMultiplier), maxPriorityFeePerGas);

        return {
          ...acc,
          tiny: {
            maxBaseFeePerGas,
            maxPriorityFeePerGas,
          },
        };
      }

      if (i === 1) {
        const { minMaxPriorityFeePerGas, priorityFeePercentageMultiplier, baseFeePercentageMultiplier } = SETTINGS_BY_PRIORITY_LEVEL.low;

        const feeWithPriorityMultiplier = times(item, priorityFeePercentageMultiplier);
        const maxPriorityFeePerGas = gt(feeWithPriorityMultiplier, minMaxPriorityFeePerGas) ? feeWithPriorityMultiplier : minMaxPriorityFeePerGas;

        const maxBaseFeePerGas = plus(times(baseFeePerGas, baseFeePercentageMultiplier), maxPriorityFeePerGas);

        return {
          ...acc,
          low: {
            maxBaseFeePerGas,
            maxPriorityFeePerGas,
          },
        };
      }

      if (i === 2) {
        const { minMaxPriorityFeePerGas, priorityFeePercentageMultiplier, baseFeePercentageMultiplier } = SETTINGS_BY_PRIORITY_LEVEL.average;

        const feeWithPriorityMultiplier = times(item, priorityFeePercentageMultiplier);
        const maxPriorityFeePerGas = gt(feeWithPriorityMultiplier, minMaxPriorityFeePerGas) ? feeWithPriorityMultiplier : minMaxPriorityFeePerGas;

        const maxBaseFeePerGas = plus(times(baseFeePerGas, baseFeePercentageMultiplier), maxPriorityFeePerGas);

        return {
          ...acc,
          average: {
            maxBaseFeePerGas,
            maxPriorityFeePerGas,
          },
        };
      }
      return acc;
    }, {} as GasFeeEstimates);
  }, [feeHistory, block]);

  const type: FeeType | null = (() => {
    if (!currentFee && !currentGasPrice) {
      return null;
    }

    const basicFeeOnlyChainIds: string[] = [];

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
