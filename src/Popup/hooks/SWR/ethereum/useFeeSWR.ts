import { useMemo } from 'react';

import { divide, plus } from '~/Popup/utils/big';
import type { EthereumChain } from '~/types/chain';
import type { FeeType } from '~/types/ethereum/common';

import { useFeeHistorySWR } from './useFeeHistorySWR';
import { useGasPriceSWR } from './useGasPriceSWR';
import { useGetBlockByNumberSWR } from './useGetBlockByNumberSWR';

export function useFeeSWR(chain: EthereumChain, suspense?: boolean) {
  const block = useGetBlockByNumberSWR(chain, ['pending', false], suspense);
  const feeHistory = useFeeHistorySWR(chain, [20, 'pending', [10, 30, 50, 70, 90]], suspense);
  const gasPrice = useGasPriceSWR(chain, suspense);

  const type: FeeType = block.data?.result?.baseFeePerGas ? 'EIP-1559' : 'BASIC';

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

  const returnData = useMemo(
    () => ({
      type,
      currentGasPrice,
      currentFee,
    }),
    [type, currentGasPrice, currentFee],
  );

  return returnData;
}
