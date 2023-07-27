import { useMemo } from 'react';
import type { GetRoute, TokenData } from '@0xsquid/sdk';

import { useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { divide, gt, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumNetwork } from '~/types/chain';
import type { IntegratedSwapChain, IntegratedSwapEVMToken } from '~/types/swap/asset';

import { useSquidRouteSWR } from '../../squid/useSquidRouteSWR';
import { useSquidTokensSWR } from '../../squid/useSquidTokensSWR';
import { useCoinGeckoPriceSWR } from '../../useCoinGeckoPriceSWR';

type useSquidSwapProps = {
  inputBaseAmount: string;
  slippage: string;
  receiverAddress: string;
  fromToken: IntegratedSwapEVMToken;
  toToken: IntegratedSwapEVMToken;
  fromChain: EthereumNetwork;
  toChain: IntegratedSwapChain;
};

export function useSquidSwap(squidSwapProps?: useSquidSwapProps) {
  const { inputBaseAmount, slippage, receiverAddress, fromChain, fromToken: srcCoin, toChain, toToken: destCoin } = squidSwapProps ?? {};

  const cosmosToTokenAssets = useCosmosAssetsSWR(toChain?.line === 'COSMOS' ? toChain : undefined);

  const supportedSquidTokens = useSquidTokensSWR();
  const { extensionStorage } = useExtensionStorage();

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const squidRouteParam = useMemo<GetRoute | undefined>(() => {
    if (fromChain?.chainId && toChain?.chainId && srcCoin?.address && destCoin?.address && receiverAddress && inputBaseAmount && gt(inputBaseAmount, '0')) {
      return {
        fromChain: fromChain.chainId,
        fromToken: srcCoin.address,
        fromAmount: inputBaseAmount,
        toChain: toChain.chainId,
        toToken: destCoin.address,
        toAddress: receiverAddress,
        slippage: Number(slippage),
      };
    }
    return undefined;
  }, [destCoin?.address, fromChain?.chainId, inputBaseAmount, receiverAddress, slippage, srcCoin?.address, toChain?.chainId]);
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
                supportedSquidTokens.data?.mainnet.find((token) => token.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, item)))
                  ?.id,
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
                      supportedSquidTokens.data?.mainnet.find((token) =>
                        token.contracts.find((contractToken) => isEqualsIgnoringCase(contractToken.address, fee.token.address)),
                      )?.id,
                )?.coinGeckoId || fee.token.coingeckoId,
            },
          })) || []),
      ],
    }));
  }, [cosmosToTokenAssets.data, squidRoute.data?.route.estimate.feeCosts, supportedSquidTokens.data?.mainnet]);

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
