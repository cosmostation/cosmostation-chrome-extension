import { useCallback, useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { SMART_CHAIN } from '~/constants/chain/ethereum/network/smartChain';
import { divide, plus } from '~/Popup/utils/big';
import type { FeeType } from '~/types/ethereum/common';

import { useFeeHistorySWR } from './useFeeHistorySWR';
import { useGasPriceSWR } from './useGasPriceSWR';
import { useGetBlockByNumberSWR } from './useGetBlockByNumberSWR';
import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';

export function useFeeSWR(config?: SWRConfiguration) {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const block = useGetBlockByNumberSWR(['pending', false], config);
  const feeHistory = useFeeHistorySWR([20, 'pending', [10, 30, 50, 70, 90]], config);
  const gasPrice = useGasPriceSWR(config);

  const currentGasPrice = gasPrice.data?.result ? plus(parseInt(gasPrice.data.result, 16), '1000') : null;

  const currentFee = useMemo(() => {
    if (!feeHistory.data?.result || !block.data?.result?.baseFeePerGas) {
      return null;
    }

    const baseFeePerGas = plus(parseInt(block.data.result.baseFeePerGas, 16), '1000');

    const originReward = feeHistory.data.result.reward || [];

    const rewardCount = originReward.length;

    const averageReward = originReward
      .reduce(
        (prev, cur) => [
          plus(prev[0], parseInt(cur[0], 16)),
          plus(prev[1], parseInt(cur[1], 16)),
          plus(prev[2], parseInt(cur[2], 16)),
          plus(prev[3], parseInt(cur[3], 16)),
          plus(prev[4], parseInt(cur[4], 16)),
        ],
        ['0', '0', '0', '0', '0'],
      )
      .map((item) => divide(item, rewardCount, 0));

    return {
      tiny: { maxBaseFeePerGas: plus(baseFeePerGas, averageReward[0]), maxPriorityFeePerGas: averageReward[0] },
      low: { maxBaseFeePerGas: plus(baseFeePerGas, averageReward[1]), maxPriorityFeePerGas: averageReward[1] },
      average: { maxBaseFeePerGas: plus(baseFeePerGas, averageReward[2]), maxPriorityFeePerGas: averageReward[2] },
      high: { maxBaseFeePerGas: plus(baseFeePerGas, averageReward[3]), maxPriorityFeePerGas: averageReward[3] },
      highest: { maxBaseFeePerGas: plus(baseFeePerGas, averageReward[4]), maxPriorityFeePerGas: averageReward[4] },
    };
  }, [feeHistory, block]);

  const type: FeeType | null = (() => {
    if (!currentFee && !currentGasPrice) {
      return null;
    }

    if (currentEthereumNetwork.id === SMART_CHAIN.id) {
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
