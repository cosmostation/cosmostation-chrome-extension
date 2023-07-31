import { useMemo } from 'react';
import type { GetRoute, TokenData } from '@0xsquid/sdk';
import { Interface } from '@ethersproject/abi';

import { ERC20_ABI } from '~/constants/abi';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { SQUID_CONTRACT_ADDRESS, SQUID_MAX_APPROVE_AMOUNT } from '~/constants/squid';
import { useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { divide, gt, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { IntegratedSwapChain, IntegratedSwapToken, SquidTokensPayload } from '~/types/swap/asset';

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
  supportedSquidTokens: SquidTokensPayload;
  senderAddress: string;
  receiverAddress: string;
  slippage: string;
};

export function useSquidSwap(squidSwapProps?: UseSquidSwapProps) {
  const {
    inputBaseAmount = '0',
    fromChain,
    toChain,
    fromToken,
    toToken,
    supportedSquidTokens,
    senderAddress,
    receiverAddress,
    slippage = '1',
  } = squidSwapProps ?? {};

  const cosmosToTokenAssets = useCosmosAssetsSWR(toChain?.line === COSMOS.line ? toChain : undefined);

  const { extensionStorage } = useExtensionStorage();

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const allowance = useAllowanceSWR(
    senderAddress && fromToken?.address && fromChain?.chainId
      ? {
          owner: senderAddress,
          spender: SQUID_CONTRACT_ADDRESS,
          tokenAddress: fromToken.address,
          chainId: fromChain.chainId,
        }
      : undefined,
  );

  const allowanceTx = useMemo(() => {
    if (senderAddress && fromToken?.address) {
      const erc20ABI = new Interface(ERC20_ABI);

      return {
        from: senderAddress,
        to: fromToken.address,
        data: erc20ABI.encodeFunctionData('approve', [SQUID_CONTRACT_ADDRESS, SQUID_MAX_APPROVE_AMOUNT]),
      };
    }
    return {
      from: '',
      to: '',
    };
  }, [fromToken?.address, senderAddress]);

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
    if (fromChain?.chainId && fromToken?.address && gt(inputBaseAmount, '0') && toChain?.chainId && toToken?.address && receiverAddress) {
      return {
        fromChain: fromChain.chainId,
        fromToken: fromToken.address,
        fromAmount: inputBaseAmount,
        toChain: toChain.chainId,
        toToken: toToken.address,
        toAddress: receiverAddress,
        slippage: Number(slippage),
        enableForecall: true,
      };
    }
    return undefined;
  }, [toToken?.address, fromChain?.chainId, inputBaseAmount, receiverAddress, slippage, fromToken?.address, toChain?.chainId]);

  const squidRoute = useSquidRouteSWR(squidRouteParam);

  const squidProcessingTime = useMemo(() => divide(squidRoute.data?.route.estimate.estimatedRouteDuration || '0', '60'), [squidRoute.data]);

  const squidSourceChainGasCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidRoute.data?.route.estimate.gasCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidRoute.data?.route.estimate.gasCosts
          .filter((gasCost) => isEqualsIgnoringCase(gasCost.token.address, item))
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: squidRoute.data?.route.estimate.gasCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token,
      feeItems: [...(squidRoute.data?.route.estimate.gasCosts.filter((fee) => isEqualsIgnoringCase(fee.token.address, item)) || [])],
    }));
  }, [squidRoute.data?.route.estimate.gasCosts]);

  const squidCrossChainFeeCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidRoute.data?.route.estimate.feeCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidRoute.data?.route.estimate.feeCosts
          .filter((feeCost) => isEqualsIgnoringCase(feeCost.token.address, item) && feeCost.name !== 'Express Fee')
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: {
        ...squidRoute.data?.route.estimate.feeCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token,
        coingeckoId:
          cosmosToTokenAssets.data.find(
            (asset) =>
              asset.counter_party?.denom &&
              asset.counter_party.denom ===
                supportedSquidTokens?.mainnet.find((token) => token.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, item)))?.id,
          )?.coinGeckoId || squidRoute.data?.route.estimate.feeCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token.coingeckoId,
      } as TokenData | undefined,
      feeItems: [
        ...(squidRoute.data?.route.estimate.feeCosts
          .filter((fee) => isEqualsIgnoringCase(fee.token.address, item))
          .map((fee) => ({
            ...fee,
            token: {
              ...fee.token,
              coingeckoId:
                cosmosToTokenAssets.data.find(
                  (asset) =>
                    asset.counter_party?.denom &&
                    asset.counter_party.denom ===
                      supportedSquidTokens?.mainnet.find((token) =>
                        token.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, fee.token.address)),
                      )?.id,
                )?.coinGeckoId || fee.token.coingeckoId,
            },
          })) || []),
      ],
    }));
  }, [cosmosToTokenAssets.data, squidRoute.data?.route.estimate.feeCosts, supportedSquidTokens?.mainnet]);

  const squidSourceChainFeeAmount = useMemo(() => squidSourceChainGasCosts?.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0', [squidSourceChainGasCosts]);

  const squidCrossChainFeeAmount = useMemo(() => squidCrossChainFeeCosts?.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0', [squidCrossChainFeeCosts]);

  const squidSourceChainTotalFeePrice = useMemo(
    () =>
      squidSourceChainGasCosts.reduce(
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
    [extensionStorage.currency, coinGeckoPrice.data, squidSourceChainGasCosts],
  );

  const squidCrossChainTotalFeePrice = useMemo(
    () =>
      squidCrossChainFeeCosts?.reduce(
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
    [extensionStorage.currency, coinGeckoPrice.data, squidCrossChainFeeCosts],
  );

  const estimatedSquidFeePrice = useMemo(
    () => plus(squidSourceChainTotalFeePrice, squidCrossChainTotalFeePrice),
    [squidCrossChainTotalFeePrice, squidSourceChainTotalFeePrice],
  );

  return {
    squidRoute,
    squidProcessingTime,
    squidSourceChainGasCosts,
    squidCrossChainFeeCosts,
    squidSourceChainFeeAmount,
    squidCrossChainFeeAmount,
    estimatedSquidFeePrice,
    allowance,
    allowanceTx,
    allowanceTxBaseFee,
    allowanceBaseEstimatedGas,
  };
}
