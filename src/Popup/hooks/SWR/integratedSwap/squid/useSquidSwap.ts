import { useMemo } from 'react';
import type { GetRoute, TokenData } from '@0xsquid/sdk';

import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { divide, gt, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { IntegratedSwapChain, IntegratedSwapToken, SquidTokensPayload } from '~/types/swap/asset';

import { useSquidRouteSWR } from './SWR/useSquidRouteSWR';
import { useCoinGeckoPriceSWR } from '../../useCoinGeckoPriceSWR';

type UseSquidSwapProps = {
  inputBaseAmount: string;
  fromChain: IntegratedSwapChain;
  toChain: IntegratedSwapChain;
  fromToken: IntegratedSwapToken;
  toToken: IntegratedSwapToken;
  supportedSquidTokens: SquidTokensPayload;
  receiverAddress: string;
  slippage: string;
};

export function useSquidSwap(squidSwapProps?: UseSquidSwapProps) {
  const { inputBaseAmount = '0', fromChain, toChain, fromToken, toToken, supportedSquidTokens, receiverAddress, slippage = '1' } = squidSwapProps ?? {};

  const cosmosToTokenAssets = useCosmosAssetsSWR(toChain?.line === COSMOS.line ? toChain : undefined);

  const { extensionStorage } = useExtensionStorage();

  const coinGeckoPrice = useCoinGeckoPriceSWR();

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
  };
}
