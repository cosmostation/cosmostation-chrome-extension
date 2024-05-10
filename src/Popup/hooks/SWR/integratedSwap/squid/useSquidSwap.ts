import { useMemo } from 'react';
import type { GetRoute, TokenData } from '@0xsquid/sdk';
import { Interface } from '@ethersproject/abi';

import { ERC20_ABI } from '~/constants/abi';
import { EVM_NATIVE_TOKEN_ADDRESS } from '~/constants/chain/ethereum/ethereum';
import { SQUID_COLLECT_FEE_BPF, SQUID_COLLECT_FEE_INTEGRATOR_ADDRESS, SQUID_CONTRACT_ADDRESS, SQUID_MAX_APPROVE_AMOUNT } from '~/constants/squid';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { divide, gt, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';

import { useAllowanceSWR } from './SWR/useAllowanceSWR';
import { useSquidRouteSWR } from './SWR/useSquidRouteSWR';
import { useEstimateGasSWR } from '../../ethereum/useEstimateGasSWR';
import { useFeeSWR } from '../../ethereum/useFeeSWR';
import { useCoinGeckoPriceSWR } from '../../useCoinGeckoPriceSWR';

type UseSquidSwapProps = {
  inputBaseAmount: string;
  fromChain: IntegratedSwapChain;
  toChain: IntegratedSwapChain;
  fromToken: IntegratedSwapToken;
  toToken: IntegratedSwapToken;
  senderAddress: string;
  receiverAddress: string;
  slippage: string;
  fallbackAddress?: string;
};

export function useSquidSwap(squidSwapProps?: UseSquidSwapProps) {
  const inputBaseAmount = useMemo(() => squidSwapProps?.inputBaseAmount || '0', [squidSwapProps?.inputBaseAmount]);
  const fromChain = useMemo(() => squidSwapProps?.fromChain, [squidSwapProps?.fromChain]);
  const toChain = useMemo(() => squidSwapProps?.toChain, [squidSwapProps?.toChain]);
  const fromToken = useMemo(() => squidSwapProps?.fromToken, [squidSwapProps?.fromToken]);
  const toToken = useMemo(() => squidSwapProps?.toToken, [squidSwapProps?.toToken]);
  const senderAddress = useMemo(() => squidSwapProps?.senderAddress, [squidSwapProps?.senderAddress]);
  const receiverAddress = useMemo(() => squidSwapProps?.receiverAddress, [squidSwapProps?.receiverAddress]);
  const slippage = useMemo(() => squidSwapProps?.slippage || '1', [squidSwapProps?.slippage]);
  const fallbackAddress = useMemo(() => squidSwapProps?.fallbackAddress, [squidSwapProps?.fallbackAddress]);

  const { extensionStorage } = useExtensionStorage();

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const allowance = useAllowanceSWR(
    senderAddress && fromToken?.tokenAddressOrDenom && fromChain?.chainId
      ? {
          owner: senderAddress,
          spender: SQUID_CONTRACT_ADDRESS,
          tokenAddress: fromToken.tokenAddressOrDenom,
          chainId: fromChain.chainId,
        }
      : undefined,
  );

  const allowanceTx = useMemo(() => {
    if (senderAddress && fromToken?.tokenAddressOrDenom) {
      const erc20ABI = new Interface(ERC20_ABI);

      return {
        from: senderAddress,
        to: fromToken.tokenAddressOrDenom,
        data: erc20ABI.encodeFunctionData('approve', [SQUID_CONTRACT_ADDRESS, SQUID_MAX_APPROVE_AMOUNT]),
      };
    }
    return {
      from: '',
      to: '',
    };
  }, [fromToken?.tokenAddressOrDenom, senderAddress]);

  const allowanceFee = useFeeSWR();

  const allowanceEstimatedGas = useEstimateGasSWR([allowanceTx]);

  const allowanceBaseEstimatedGas = useMemo(() => BigInt(allowanceEstimatedGas.data?.result || '21000').toString(10), [allowanceEstimatedGas.data?.result]);

  const allowanceBaseFeePerGas = useMemo(() => {
    if (allowanceFee.type === 'BASIC') return allowanceFee.currentGasPrice || '0';
    if (allowanceFee.type === 'EIP-1559') return allowanceFee.currentFee?.average.maxBaseFeePerGas || '0';

    return '0';
  }, [allowanceFee.currentFee?.average.maxBaseFeePerGas, allowanceFee.currentGasPrice, allowanceFee.type]);

  const allowanceTxBaseFee = useMemo(() => times(allowanceBaseFeePerGas, allowanceBaseEstimatedGas), [allowanceBaseEstimatedGas, allowanceBaseFeePerGas]);

  const squidRouteParam = useMemo<GetRoute | undefined>(() => {
    if (
      fromChain?.chainId &&
      fromToken?.tokenAddressOrDenom &&
      gt(inputBaseAmount, '0') &&
      toChain?.chainId &&
      toToken?.tokenAddressOrDenom &&
      receiverAddress &&
      senderAddress
    ) {
      return {
        fromAddress: senderAddress,
        fromChain: fromChain.chainId,
        fromToken: fromToken.tokenAddressOrDenom,
        fromAmount: inputBaseAmount,
        toChain: toChain.chainId,
        toToken: toToken.tokenAddressOrDenom,
        toAddress: receiverAddress,
        slippage: Number(slippage),
        collectFees: {
          integratorAddress: SQUID_COLLECT_FEE_INTEGRATOR_ADDRESS,
          fee: SQUID_COLLECT_FEE_BPF,
        },
        enableExpress: false,
        fallbackAddresses: fallbackAddress
          ? [
              {
                address: fallbackAddress,
                coinType: '118',
              },
            ]
          : undefined,
      };
    }
    return undefined;
  }, [
    fallbackAddress,
    fromChain?.chainId,
    fromToken?.tokenAddressOrDenom,
    inputBaseAmount,
    receiverAddress,
    senderAddress,
    slippage,
    toChain?.chainId,
    toToken?.tokenAddressOrDenom,
  ]);

  const squidEthRoute = useSquidRouteSWR(squidRouteParam);

  const squidEthProcessingTime = useMemo(() => divide(squidEthRoute.data?.route.estimate.estimatedRouteDuration || '0', '60'), [squidEthRoute.data]);

  const squidEthSourceChainGasCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidEthRoute.data?.route.estimate.gasCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidEthRoute.data?.route.estimate.gasCosts
          .filter((gasCost) => isEqualsIgnoringCase(gasCost.token.address, item))
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: { ...squidEthRoute.data?.route.estimate.gasCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token } as TokenData | undefined,
      feeItems: squidEthRoute.data?.route.estimate.gasCosts.filter((fee) => isEqualsIgnoringCase(fee.token.address, item)) || [],
    }));
  }, [squidEthRoute.data?.route.estimate.gasCosts]);

  const squidEthCrossChainFeeCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidEthRoute.data?.route.estimate.feeCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidEthRoute.data?.route.estimate.feeCosts
          .filter((feeCost) => isEqualsIgnoringCase(feeCost.token.address, item) && feeCost.name !== 'Express Fee')
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: { ...squidEthRoute.data?.route.estimate.feeCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token } as TokenData | undefined,
      feeItems: squidEthRoute.data?.route.estimate.feeCosts.filter((fee) => isEqualsIgnoringCase(fee.token.address, item)) || [],
    }));
  }, [squidEthRoute.data?.route.estimate.feeCosts]);

  const squidEthSourceChainFeeAmount = useMemo(
    () =>
      squidEthSourceChainGasCosts
        ?.filter((item) => isEqualsIgnoringCase(item.feeToken?.address, EVM_NATIVE_TOKEN_ADDRESS))
        .reduce((ac, cu) => plus(ac, cu.amount), '0') || '0',
    [squidEthSourceChainGasCosts],
  );

  const squidEthCrossChainFeeAmount = useMemo(
    () =>
      squidEthCrossChainFeeCosts
        ?.filter((item) => isEqualsIgnoringCase(item.feeToken?.address, EVM_NATIVE_TOKEN_ADDRESS))
        .reduce((ac, cu) => plus(ac, cu.amount), '0') || '0',
    [squidEthCrossChainFeeCosts],
  );

  const squidEthSourceChainTotalFeePrice = useMemo(
    () =>
      squidEthSourceChainGasCosts.reduce(
        (ac, cu) =>
          plus(
            ac,
            times(
              toDisplayDenomAmount(cu.amount || '0', cu.feeToken?.decimals || 0),
              (cu.feeToken?.coingeckoId && coinGeckoPrice.data?.[cu.feeToken.coingeckoId]?.[extensionStorage.currency]) || '0',
            ),
          ),
        '0',
      ) || '0',
    [extensionStorage.currency, coinGeckoPrice.data, squidEthSourceChainGasCosts],
  );

  const squidCrossChainTotalFeePrice = useMemo(
    () =>
      squidEthCrossChainFeeCosts?.reduce(
        (ac, cu) =>
          plus(
            ac,
            times(
              toDisplayDenomAmount(cu.amount || '0', cu.feeToken?.decimals || 0),
              (cu.feeToken?.coingeckoId && coinGeckoPrice.data?.[cu.feeToken.coingeckoId]?.[extensionStorage.currency]) || '0',
            ),
          ),
        '0',
      ) || '0',
    [extensionStorage.currency, coinGeckoPrice.data, squidEthCrossChainFeeCosts],
  );

  const estimatedSquidEthFeePrice = useMemo(
    () => plus(squidEthSourceChainTotalFeePrice, squidCrossChainTotalFeePrice),
    [squidCrossChainTotalFeePrice, squidEthSourceChainTotalFeePrice],
  );

  return {
    squidEthRoute,
    squidEthProcessingTime,
    squidEthSourceChainGasCosts,
    squidEthCrossChainFeeCosts,
    squidEthSourceChainFeeAmount,
    squidEthCrossChainFeeAmount,
    estimatedSquidEthFeePrice,
    allowance,
    allowanceTx,
    allowanceTxBaseFee,
    allowanceBaseEstimatedGas,
  };
}
