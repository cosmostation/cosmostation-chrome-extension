import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import type { GetRoute, TokenData } from '@0xsquid/sdk';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { SQUID_COLLECT_FEE_BPF, SQUID_COLLECT_FEE_INTEGRATOR_ADDRESS } from '~/constants/squid';
import { useAssetsSWR, useAssetsSWR as useCosmosAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { divide, gt, plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { convertAssetNameToCosmos, findCosmosChainByAddress, getPublicKeyType } from '~/Popup/utils/cosmos';
import { protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { IntegratedSwapChain, IntegratedSwapToken } from '~/types/swap/asset';
import type { TransferPayload, WasmPayload } from '~/types/swap/squid';

import { useSquidRouteSWR } from './SWR/useSquidRouteSWR';
import { useAccountSWR } from '../../cosmos/useAccountSWR';
import { useBlockLatestSWR } from '../../cosmos/useBlockLatestSWR';
import { useChainIdToAssetNameMapsSWR } from '../../cosmos/useChainIdToAssetNameMapsSWR';
import { useClientStateSWR } from '../../cosmos/useClientStateSWR';
import { useGasMultiplySWR } from '../../cosmos/useGasMultiplySWR';
import { useNodeInfoSWR } from '../../cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '../../cosmos/useSimulateSWR';
import { useCoinGeckoPriceSWR } from '../../useCoinGeckoPriceSWR';

type UseSquidCosmosSwapProps = {
  inputBaseAmount: string;
  fromChain: CosmosChain;
  toChain: IntegratedSwapChain;
  fromToken: IntegratedSwapToken;
  toToken: IntegratedSwapToken;
  senderAddress: string;
  receiverAddress: string;
  slippage: string;
};

type SquidContractSwapMsg = {
  msgTypeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract';
  msg: WasmPayload;
};

type SquidTransferSwapMsg = {
  msgTypeUrl: '/ibc.applications.transfer.v1.MsgTransfer';
  msg: TransferPayload;
};

type SquidCosmosSwapMsg = SquidTransferSwapMsg | SquidContractSwapMsg;

export function useSquidCosmosSwap(squidSwapProps?: UseSquidCosmosSwapProps) {
  const inputBaseAmount = useMemo(() => squidSwapProps?.inputBaseAmount || '0', [squidSwapProps?.inputBaseAmount]);
  const fromChain = useMemo(() => squidSwapProps?.fromChain, [squidSwapProps?.fromChain]);
  const toChain = useMemo(() => squidSwapProps?.toChain, [squidSwapProps?.toChain]);
  const fromToken = useMemo(() => squidSwapProps?.fromToken, [squidSwapProps?.fromToken]);
  const toToken = useMemo(() => squidSwapProps?.toToken, [squidSwapProps?.toToken]);
  const senderAddress = useMemo(() => squidSwapProps?.senderAddress, [squidSwapProps?.senderAddress]);
  const receiverAddress = useMemo(() => squidSwapProps?.receiverAddress, [squidSwapProps?.receiverAddress]);
  const slippage = useMemo(() => squidSwapProps?.slippage || '1', [squidSwapProps?.slippage]);

  const account = useAccountSWR(fromChain || COSMOS_CHAINS[0]);
  const nodeInfo = useNodeInfoSWR(fromChain || COSMOS_CHAINS[0]);
  const cosmosFromTokenAssets = useCosmosAssetsSWR(fromChain?.line === COSMOS.line ? fromChain : undefined);

  const { extensionStorage } = useExtensionStorage();

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const squidRouteParam = useMemo<GetRoute | undefined>(() => {
    if (fromChain?.chainId && fromToken?.address && gt(inputBaseAmount, '0') && toChain?.chainId && toToken?.address && receiverAddress && senderAddress) {
      return {
        fromAddress: senderAddress,
        fromChain: fromChain.chainId,
        fromToken: fromToken.address,
        fromAmount: inputBaseAmount,
        toChain: toChain.chainId,
        toToken: toToken.address,
        toAddress: receiverAddress,
        slippage: Number(slippage),
        collectFees: {
          integratorAddress: SQUID_COLLECT_FEE_INTEGRATOR_ADDRESS,
          fee: SQUID_COLLECT_FEE_BPF,
        },
        enableForecall: true,
        enableExpress: false,
      };
    }
    return undefined;
  }, [toToken?.address, fromChain?.chainId, inputBaseAmount, receiverAddress, slippage, fromToken?.address, toChain?.chainId, senderAddress]);

  const squidCosmosRoute = useSquidRouteSWR(squidRouteParam);

  const squidCosmosProcessingTime = useMemo(() => divide(squidCosmosRoute.data?.route.estimate.estimatedRouteDuration || '0', '60'), [squidCosmosRoute.data]);

  const squidCosmosSourceChainGasCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidCosmosRoute.data?.route.estimate.gasCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidCosmosRoute.data?.route.estimate.gasCosts
          .filter((gasCost) => isEqualsIgnoringCase(gasCost.token.address, item))
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: squidCosmosRoute.data?.route.estimate.gasCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token,
      feeItems: [...(squidCosmosRoute.data?.route.estimate.gasCosts.filter((fee) => isEqualsIgnoringCase(fee.token.address, item)) || [])],
    }));
  }, [squidCosmosRoute.data?.route.estimate.gasCosts]);

  const squidCosmosCrossChainFeeCosts = useMemo(() => {
    const feeTokenAddressList = Array.from(new Set([...(squidCosmosRoute.data?.route.estimate.feeCosts.map((item) => item.token.address) || [])]));

    return feeTokenAddressList.map((item) => ({
      amount:
        squidCosmosRoute.data?.route.estimate.feeCosts
          .filter((feeCost) => isEqualsIgnoringCase(feeCost.token.address, item) && feeCost.name !== 'Express Fee')
          .reduce((ac, cu) => (isEqualsIgnoringCase(item, cu.token.address) ? plus(ac, cu.amount) : ac), '0') || '0',
      feeToken: {
        ...squidCosmosRoute.data?.route.estimate.feeCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token,
        coingeckoId:
          cosmosFromTokenAssets.data.find((asset) => isEqualsIgnoringCase(item, asset.denom))?.coinGeckoId ||
          squidCosmosRoute.data?.route.estimate.feeCosts.find((fee) => isEqualsIgnoringCase(fee.token.address, item))?.token.coingeckoId,
      } as TokenData | undefined,
      feeItems: [
        ...(squidCosmosRoute.data?.route.estimate.feeCosts
          .filter((fee) => isEqualsIgnoringCase(fee.token.address, item))
          .map((fee) => ({
            ...fee,
            token: {
              ...fee.token,
              coingeckoId: cosmosFromTokenAssets.data.find((asset) => isEqualsIgnoringCase(item, asset.denom))?.coinGeckoId || fee.token.coingeckoId,
            },
          })) || []),
      ],
    }));
  }, [cosmosFromTokenAssets.data, squidCosmosRoute.data?.route.estimate.feeCosts]);

  const squidCosmosSourceChainFeeAmount = useMemo(
    () => squidCosmosSourceChainGasCosts?.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0',
    [squidCosmosSourceChainGasCosts],
  );

  const squidCosmosCrossChainFeeAmount = useMemo(
    () => squidCosmosCrossChainFeeCosts?.reduce((ac, cu) => plus(ac, cu.amount), '0') || '0',
    [squidCosmosCrossChainFeeCosts],
  );

  const squidSourceChainTotalFeePrice = useMemo(
    () =>
      squidCosmosSourceChainGasCosts.reduce(
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
    [extensionStorage.currency, coinGeckoPrice.data, squidCosmosSourceChainGasCosts],
  );

  const squidCrossChainTotalFeePrice = useMemo(
    () =>
      squidCosmosCrossChainFeeCosts?.reduce(
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
    [extensionStorage.currency, coinGeckoPrice.data, squidCosmosCrossChainFeeCosts],
  );

  const estimatedSquidCosmosFeePrice = useMemo(
    () => plus(squidSourceChainTotalFeePrice, squidCrossChainTotalFeePrice),
    [squidCrossChainTotalFeePrice, squidSourceChainTotalFeePrice],
  );

  const parsedSquidSwapTx = useMemo(
    () =>
      squidCosmosRoute.data?.route.transactionRequest?.data
        ? (JSON.parse(squidCosmosRoute.data.route.transactionRequest.data) as SquidCosmosSwapMsg)
        : undefined,
    [squidCosmosRoute.data?.route.transactionRequest?.data],
  );

  const chainInfo = useMemo(() => {
    const chain = COSMOS_CHAINS.find((item) => item.chainId === fromChain?.chainId);
    const channelId = parsedSquidSwapTx?.msgTypeUrl === '/ibc.applications.transfer.v1.MsgTransfer' ? parsedSquidSwapTx?.msg.sourceChannel : '';
    const port = parsedSquidSwapTx?.msgTypeUrl === '/ibc.applications.transfer.v1.MsgTransfer' ? parsedSquidSwapTx?.msg.sourcePort : '';

    return { chain, channelId, port };
  }, [fromChain?.chainId, parsedSquidSwapTx]);

  const clientState = useClientStateSWR({
    chain: chainInfo.chain || COSMOS_CHAINS[0],
    channelId: chainInfo.channelId || '',
    port: chainInfo.port || '',
  });

  const { data: chainIdToAssetNameMaps } = useChainIdToAssetNameMapsSWR();

  const assets = useAssetsSWR(chainInfo.chain || COSMOS_CHAINS[0]);

  const channelChain = useMemo(() => {
    const asset = assets.data?.find((item) => item.channel === chainInfo.channelId && item.port === chainInfo.port);

    if (asset?.origin_chain) {
      return convertAssetNameToCosmos(asset?.origin_chain || '', chainIdToAssetNameMaps);
    }

    const transferMsg = parsedSquidSwapTx?.msgTypeUrl === '/ibc.applications.transfer.v1.MsgTransfer' ? parsedSquidSwapTx : undefined;

    return findCosmosChainByAddress(transferMsg?.msg.receiver);
  }, [assets.data, parsedSquidSwapTx, chainInfo.channelId, chainInfo.port]);

  const channelChainLatestBlock = useBlockLatestSWR(channelChain);

  const latestHeight = useMemo(() => channelChainLatestBlock.data?.block?.header?.height, [channelChainLatestBlock.data?.block?.header?.height]);

  const revisionHeight = useMemo(() => (latestHeight ? String(100 + parseInt(latestHeight, 10)) : undefined), [latestHeight]);

  const revisionNumber = useMemo(
    () => clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number,
    [clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number],
  );

  const memoizedSquidSwapAminoTx = useMemo(() => {
    if (gt(inputBaseAmount, '0') && account.data?.value.account_number && fromChain?.chainId && fromChain.line === 'COSMOS' && parsedSquidSwapTx) {
      const sequence = String(account.data?.value.sequence || '0');

      if (parsedSquidSwapTx.msgTypeUrl === '/ibc.applications.transfer.v1.MsgTransfer') {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? fromChain.chainId,
          fee: { amount: [{ amount: '1', denom: fromChain.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
          memo: '',
          msgs: [
            {
              type: 'cosmos-sdk/MsgTransfer',
              value: {
                source_port: parsedSquidSwapTx.msg.sourcePort || 'transfer',
                source_channel: parsedSquidSwapTx.msg.sourceChannel,
                token: parsedSquidSwapTx.msg.token,
                sender: parsedSquidSwapTx.msg.sender,
                receiver: parsedSquidSwapTx.msg.receiver,
                timeout_height: {
                  revision_height: revisionHeight,
                  revision_number: revisionNumber === '0' ? undefined : revisionNumber,
                },
                timeoutTimestamp: undefined,
                memo: parsedSquidSwapTx.msg.memo,
              },
            },
          ],
        };
      }

      if (parsedSquidSwapTx.msgTypeUrl === '/cosmwasm.wasm.v1.MsgExecuteContract') {
        return {
          account_number: String(account.data.value.account_number),
          sequence,
          chain_id: nodeInfo.data?.default_node_info?.network ?? fromChain.chainId,
          fee: { amount: [{ amount: '1', denom: fromChain.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
          memo: '',
          msgs: [
            {
              type: 'wasm/MsgExecuteContract',
              value: {
                sender: senderAddress,
                contract: parsedSquidSwapTx.msg.wasm.contract,
                funds: [
                  {
                    amount: squidCosmosRoute.data?.route.estimate.fromAmount,
                    denom: fromToken?.address,
                  },
                ],
                msg: parsedSquidSwapTx.msg.wasm.msg,
              },
            },
          ],
        };
      }
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    fromChain,
    inputBaseAmount,
    fromToken?.address,
    squidCosmosRoute.data?.route.estimate.fromAmount,
    nodeInfo.data?.default_node_info?.network,
    parsedSquidSwapTx,
    revisionHeight,
    revisionNumber,
    senderAddress,
  ]);

  const [squidSwapAminoTx] = useDebounce(memoizedSquidSwapAminoTx, 700);

  const squidSwapProtoTx = useMemo(() => {
    if (squidSwapAminoTx && fromChain?.line === 'COSMOS') {
      const pTx = protoTx(squidSwapAminoTx, '', {
        type: getPublicKeyType(fromChain),
        value: '',
      });

      return pTx && protoTxBytes({ ...pTx });
    }
    return null;
  }, [fromChain, squidSwapAminoTx]);

  const squidSwapSimulate = useSimulateSWR({ chain: fromChain?.line === 'COSMOS' ? fromChain : COSMOS_CHAINS[0], txBytes: squidSwapProtoTx?.tx_bytes });

  const { data: gasMultiply } = useGasMultiplySWR(fromChain);

  const squidSwapSimulatedGas = useMemo(
    () =>
      squidSwapSimulate.data?.gas_info?.gas_used && fromChain?.line === 'COSMOS' ? times(squidSwapSimulate.data.gas_info.gas_used, gasMultiply, 0) : undefined,

    [fromChain?.line, gasMultiply, squidSwapSimulate.data?.gas_info?.gas_used],
  );

  return {
    squidCosmosRoute,
    squidCosmosProcessingTime,
    squidCosmosSourceChainGasCosts,
    squidCosmosCrossChainFeeCosts,
    squidCosmosSourceChainFeeAmount,
    squidCosmosCrossChainFeeAmount,
    estimatedSquidCosmosFeePrice,
    memoizedSquidSwapAminoTx,
    squidSwapSimulatedGas,
    squidSwapAminoTx,
  };
}
