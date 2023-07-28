import { useMemo } from 'react';

import { gt, times } from '~/Popup/utils/big';
import { toHex } from '~/Popup/utils/string';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import { useAllowanceSWR } from './SWR/useAllowanceSWR';
import { useAllowanceTxSWR } from './SWR/useAllowanceTxSWR';
import type { UseOneInchSwapSWRProps } from './SWR/useOneInchSwapTxSWR';
import { useOneInchSwapTxSWR } from './SWR/useOneInchSwapTxSWR';
import { useEstimateGasSWR } from '../../ethereum/useEstimateGasSWR';
import { useFeeSWR } from '../../ethereum/useFeeSWR';

type UseOneInchSwapProps = {
  inputBaseAmount: string;
  fromChain: IntegratedSwapChain;
  fromToken: IntegratedSwapToken;
  toToken: IntegratedSwapToken;
  senderAddress: string;
  slippage: string;
};

export function useOneInchSwap(oneInchSwapProps?: UseOneInchSwapProps) {
  const { inputBaseAmount = '0', fromChain, fromToken, toToken, senderAddress, slippage = '1' } = oneInchSwapProps ?? {};

  const allowance = useAllowanceSWR(
    fromToken?.address && senderAddress && fromChain?.chainId
      ? {
          tokenAddress: fromToken.address,
          walletAddress: senderAddress,
          chainId: fromChain.chainId,
        }
      : undefined,
  );

  const allowanceTxData = useAllowanceTxSWR(
    !gt(allowance.data?.allowance || '0', inputBaseAmount) && fromToken?.address && fromChain?.chainId
      ? {
          tokenAddress: fromToken.address,
          chainId: fromChain.chainId,
        }
      : undefined,
  );

  const allowanceTx = useMemo(() => {
    if (allowanceTxData.data && senderAddress) {
      return {
        from: senderAddress,
        to: allowanceTxData.data.to,
        data: allowanceTxData.data.data,
        value: toHex(allowanceTxData.data.value, { addPrefix: true, isStringNumber: true }),
      };
    }

    return {
      from: '',
      to: '',
    };
  }, [allowanceTxData, senderAddress]);

  const allowanceFee = useFeeSWR();

  const allowanceEstimatedGas = useEstimateGasSWR([allowanceTx]);

  const allowanceBaseEstimatedGas = useMemo(() => BigInt(allowanceEstimatedGas.data?.result || '21000').toString(10), [allowanceEstimatedGas.data?.result]);

  const allowanceBaseFeePerGas = useMemo(() => {
    if (allowanceFee.type === 'BASIC') return allowanceFee.currentGasPrice || '0';
    if (allowanceFee.type === 'EIP-1559') return allowanceFee.currentFee?.average.maxBaseFeePerGas || '0';

    return '0';
  }, [allowanceFee.currentFee?.average.maxBaseFeePerGas, allowanceFee.currentGasPrice, allowanceFee.type]);

  const allowanceTxBaseFee = useMemo(() => times(allowanceBaseFeePerGas, allowanceBaseEstimatedGas), [allowanceBaseEstimatedGas, allowanceBaseFeePerGas]);

  const oneInchRouteParam = useMemo<UseOneInchSwapSWRProps | undefined>(() => {
    if (
      fromToken?.address &&
      toToken?.address &&
      senderAddress &&
      gt(inputBaseAmount, '0') &&
      gt(allowance.data?.allowance || '0', inputBaseAmount) &&
      fromChain?.chainId
    ) {
      return {
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        fromAddress: senderAddress,
        slippage,
        amount: inputBaseAmount,
        chainId: fromChain.chainId,
      };
    }
    return undefined;
  }, [fromToken?.address, toToken?.address, fromChain?.chainId, inputBaseAmount, allowance.data?.allowance, slippage, senderAddress]);

  const oneInchRoute = useOneInchSwapTxSWR(oneInchRouteParam);

  return { oneInchRoute, allowance, allowanceTx, allowanceBaseEstimatedGas, allowanceTxBaseFee };
}
