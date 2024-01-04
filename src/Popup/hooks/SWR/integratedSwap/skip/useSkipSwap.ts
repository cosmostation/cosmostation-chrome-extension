import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { AFFILIATES, DEFAULT_BPF } from '~/constants/skip';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { gt, times } from '~/Popup/utils/big';
import { convertAssetNameToCosmos, findCosmosChainByAddress, getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { convertDirectMsgTypeToAminoMsgType, protoTx, protoTxBytes } from '~/Popup/utils/proto';
import type { CosmosChain } from '~/types/chain';
import type { MsgExecuteContract, MsgTransfer } from '~/types/cosmos/amino';
import type { AssetV3 as CosmosAssetV3 } from '~/types/cosmos/asset';
import type { Affiliates } from '~/types/swap/skip';

import { type SkipRouteProps, useSkipRouteSWR } from './SWR/useSkipRouteSWR';
import type { SkipSwapTxParam } from './SWR/useSkipSwapTxSWR';
import { useSkipSwapTxSWR } from './SWR/useSkipSwapTxSWR';
import { useAccounts } from '../../cache/useAccounts';
import { useAccountSWR } from '../../cosmos/useAccountSWR';
import { useAssetsSWR } from '../../cosmos/useAssetsSWR';
import { useBlockLatestSWR } from '../../cosmos/useBlockLatestSWR';
import { useClientStateSWR } from '../../cosmos/useClientStateSWR';
import { useNodeInfoSWR } from '../../cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '../../cosmos/useSimulateSWR';

type UseSkipSwapProps = {
  inputBaseAmount: string;
  fromChain: CosmosChain;
  toChain: CosmosChain;
  fromToken: CosmosAssetV3;
  toToken: CosmosAssetV3;
  slippage: string;
};

export function useSkipSwap(skipSwapProps?: UseSkipSwapProps) {
  const inputBaseAmount = useMemo(() => skipSwapProps?.inputBaseAmount || '0', [skipSwapProps?.inputBaseAmount]);
  const fromChain = useMemo(() => skipSwapProps?.fromChain, [skipSwapProps?.fromChain]);
  const toChain = useMemo(() => skipSwapProps?.toChain, [skipSwapProps?.toChain]);
  const fromToken = useMemo(() => skipSwapProps?.fromToken, [skipSwapProps?.fromToken]);
  const toToken = useMemo(() => skipSwapProps?.toToken, [skipSwapProps?.toToken]);
  const slippage = useMemo(() => skipSwapProps?.slippage || '1', [skipSwapProps?.slippage]);

  const accounts = useAccounts();
  const account = useAccountSWR(fromChain || COSMOS_CHAINS[0]);
  const nodeInfo = useNodeInfoSWR(fromChain || COSMOS_CHAINS[0]);

  const { currentAccount } = useCurrentAccount();

  const skipRouteParam = useMemo<SkipRouteProps | undefined>(() => {
    if (gt(inputBaseAmount, '0') && fromToken?.denom && fromChain?.chainId && toToken?.denom && toChain?.chainId) {
      return {
        amountIn: inputBaseAmount,
        sourceAssetDenom: fromToken.denom,
        sourceAssetChainId: fromChain.chainId,
        destAssetDenom: toToken.denom,
        destAssetChainId: toChain.chainId,
        cumulativeAffiliateFeeBps: DEFAULT_BPF,
      };
    }
    return undefined;
  }, [toToken?.denom, fromChain?.chainId, inputBaseAmount, fromToken?.denom, toChain?.chainId]);

  const skipRoute = useSkipRouteSWR({ routeParam: skipRouteParam });

  const skipSwapVenueChain = useMemo(
    () => COSMOS_CHAINS.find((item) => item.chainId === skipRoute.data?.swap_venue?.chain_id),
    [skipRoute.data?.swap_venue?.chain_id],
  );

  const currentAccountAddresses = useMemo(() => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address, [accounts?.data, currentAccount.id]);

  const apiRequiredAddresses = useMemo(
    () => skipRoute.data?.chain_ids.map((chainId) => currentAccountAddresses?.[COSMOS_CHAINS.find((item) => item.chainId === chainId)?.id || ''] || '') || [],
    [currentAccountAddresses, skipRoute.data?.chain_ids],
  );

  const affiliates = useMemo<Affiliates[]>(() => {
    if (gt(DEFAULT_BPF, '0')) {
      return AFFILIATES.cosmos.find((item) => item.chainId === skipRoute.data?.swap_venue?.chain_id)?.affiliate || [];
    }
    return [];
  }, [skipRoute.data?.swap_venue?.chain_id]);

  const skipSwapTxParam = useMemo<SkipSwapTxParam | undefined>(() => {
    if (skipRoute.data && skipRoute.data.chain_ids.length > 0 && skipRoute.data.operations.length > 0 && apiRequiredAddresses) {
      return {
        ...skipRoute.data,
        affiliates,
        slippage,
        addresses: apiRequiredAddresses,
      };
    }
    return undefined;
  }, [affiliates, apiRequiredAddresses, skipRoute.data, slippage]);

  const skipSwapTx = useSkipSwapTxSWR({
    skipSwapTxParam,
  });

  const skipSwapParsedTx = useMemo(
    () =>
      skipSwapTx.data?.msgs.map((item) => {
        if (item.msg_type_url === '/ibc.applications.transfer.v1.MsgTransfer') {
          const parsedMsg = JSON.parse(item.msg) as MsgTransfer;

          return {
            chain_id: item.chain_id,
            path: item.path,
            msg_type_url: convertDirectMsgTypeToAminoMsgType(item.msg_type_url),
            msg: {
              source_port: parsedMsg.source_port,
              source_channel: parsedMsg.source_channel,
              token: parsedMsg.token,
              sender: parsedMsg.sender,
              receiver: parsedMsg.receiver,
              timeout_height: {
                revision_height: parsedMsg.timeout_height.revision_height,
                revision_number: parsedMsg.timeout_height.revision_height,
              },
              timeout_timestamp: parsedMsg.timeout_timestamp,
              memo: parsedMsg.memo,
            },
          };
        }
        if (item.msg_type_url === '/cosmwasm.wasm.v1.MsgExecuteContract') {
          const parsedMsg = JSON.parse(item.msg) as MsgExecuteContract;

          return {
            chain_id: item.chain_id,
            path: item.path,
            msg_type_url: convertDirectMsgTypeToAminoMsgType(item.msg_type_url),
            msg: {
              sender: parsedMsg.sender,
              contract: parsedMsg.contract,
              funds: parsedMsg.funds,
              msg: parsedMsg.msg,
            },
          };
        }
        return undefined;
      }) || [],
    [skipSwapTx.data?.msgs],
  );

  const chainInfo = useMemo(() => {
    const info = skipSwapParsedTx.find((msg) => msg?.msg_type_url === 'cosmos-sdk/MsgTransfer');

    const chain = COSMOS_CHAINS.find((item) => item.chainId === info?.chain_id);
    const channelId = info?.msg.source_channel;
    const port = info?.msg.source_port;

    return { chain, channelId, port };
  }, [skipSwapParsedTx]);

  const clientState = useClientStateSWR({
    chain: chainInfo.chain || COSMOS_CHAINS[0],
    channelId: chainInfo.channelId || '',
    port: chainInfo.port || '',
  });

  const assets = useAssetsSWR(chainInfo.chain || COSMOS_CHAINS[0]);

  const channelChain = useMemo(() => {
    const asset = assets.data?.find((item) => item.channel === chainInfo.channelId && item.port === chainInfo.port);
    if (asset?.origin_chain) {
      return convertAssetNameToCosmos(asset.origin_chain);
    }
    const transferMsg = skipSwapParsedTx.find((msg) => msg?.msg_type_url === 'cosmos-sdk/MsgTransfer');

    return findCosmosChainByAddress(transferMsg?.msg.receiver);
  }, [assets.data, chainInfo.channelId, chainInfo.port, skipSwapParsedTx]);

  const channelChainLatestBlock = useBlockLatestSWR(channelChain);

  const latestHeight = useMemo(() => channelChainLatestBlock.data?.block?.header?.height, [channelChainLatestBlock.data?.block?.header?.height]);

  const revisionHeight = useMemo(() => (latestHeight ? String(100 + parseInt(latestHeight, 10)) : undefined), [latestHeight]);

  const revisionNumber = useMemo(
    () => clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number,
    [clientState.data?.identified_client_state?.client_state?.latest_height?.revision_number],
  );

  const skipSwapAminoTxMsgs = useMemo(
    () =>
      skipSwapParsedTx.map((item) => {
        if (item?.msg_type_url === 'cosmos-sdk/MsgTransfer' && !!revisionHeight && !!revisionNumber) {
          return {
            ...item,
            msg: {
              ...item?.msg,
              timeout_height: {
                revision_height: revisionHeight,
                revision_number: revisionNumber,
              },
              timeout_timestamp: undefined,
            },
          };
        }
        return item;
      }),
    [revisionHeight, revisionNumber, skipSwapParsedTx],
  );

  const memoizedSkipSwapAminoTx = useMemo(() => {
    if (gt(inputBaseAmount, '0') && account.data?.value.account_number && fromChain?.chainId && skipSwapAminoTxMsgs.length > 0) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.default_node_info?.network ?? fromChain.chainId,
        fee: { amount: [{ amount: '1', denom: fromChain.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: skipSwapAminoTxMsgs.map((item) => ({
          type: item?.msg_type_url || '',
          value: item?.msg,
        })),
      };
    }

    return undefined;
  }, [
    account.data?.value.account_number,
    account.data?.value.sequence,
    fromChain?.baseDenom,
    fromChain?.chainId,
    inputBaseAmount,
    nodeInfo.data?.default_node_info?.network,
    skipSwapAminoTxMsgs,
  ]);

  const [skipSwapAminoTx] = useDebounce(memoizedSkipSwapAminoTx, 700);

  const skipSwapProtoTx = useMemo(() => {
    if (skipSwapAminoTx && fromChain) {
      const pTx = protoTx(skipSwapAminoTx, '', {
        type: getPublicKeyType(fromChain),
        value: '',
      });

      return pTx && protoTxBytes({ ...pTx });
    }
    return null;
  }, [fromChain, skipSwapAminoTx]);

  const skipSwapSimulate = useSimulateSWR({ chain: fromChain || COSMOS_CHAINS[0], txBytes: skipSwapProtoTx?.tx_bytes });

  const skipSwapSimulatedGas = useMemo(
    () => (skipSwapSimulate.data?.gas_info?.gas_used ? times(skipSwapSimulate.data.gas_info.gas_used, getDefaultAV(fromChain), 0) : undefined),

    [fromChain, skipSwapSimulate.data?.gas_info?.gas_used],
  );

  return { skipRoute, skipSwapVenueChain, skipSwapTx, memoizedSkipSwapAminoTx, skipSwapAminoTx, skipSwapSimulatedGas };
}
