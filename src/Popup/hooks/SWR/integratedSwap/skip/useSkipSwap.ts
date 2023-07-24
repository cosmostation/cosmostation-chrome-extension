import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { gt, times } from '~/Popup/utils/big';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
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
import { useClientStateSWR } from '../../cosmos/useClientStateSWR';
import { useNodeInfoSWR } from '../../cosmos/useNodeinfoSWR';
import { useSimulateSWR } from '../../cosmos/useSimulateSWR';

type useSkipSwapProps = {
  inputBaseAmount: string;
  slippage: string;
  srcCoin: CosmosAssetV3;
  destCoin: CosmosAssetV3;
  fromChain: CosmosChain;
  toChain: CosmosChain;
  affiliates: Affiliates[];
};

export function useSkipSwap(skipSwapProps?: useSkipSwapProps) {
  const { inputBaseAmount, slippage, fromChain, srcCoin, toChain, destCoin, affiliates } = skipSwapProps ?? {};

  const accounts = useAccounts();
  const account = useAccountSWR(fromChain);
  const nodeInfo = useNodeInfoSWR(fromChain);

  const { currentAccount } = useCurrentAccount();

  const skipRouteParam = useMemo<SkipRouteProps | undefined>(() => {
    if (
      inputBaseAmount &&
      gt(inputBaseAmount || '0', '0') &&
      srcCoin?.denom &&
      fromChain?.line === 'COSMOS' &&
      fromChain?.chainId &&
      destCoin?.denom &&
      toChain?.chainId
    ) {
      return {
        amountIn: inputBaseAmount,
        sourceAssetDenom: srcCoin.denom,
        sourceAssetChainId: fromChain.chainId,
        destAssetDenom: destCoin.denom,
        destAssetChainId: toChain.chainId,
        cumulativeAffiliateFeeBps: '0',
      };
    }
    return undefined;
  }, [destCoin?.denom, fromChain?.chainId, fromChain?.line, inputBaseAmount, srcCoin?.denom, toChain?.chainId]);

  const skipRoute = useSkipRouteSWR({ routeParam: skipRouteParam });

  const currentAccountAddresses = useMemo(() => accounts?.data?.find((ac) => ac.id === currentAccount.id)?.address, [accounts?.data, currentAccount.id]);

  const apiRequiredAddresses = useMemo(
    () =>
      skipRoute.data?.chain_ids.reduce((acc, chainId) => {
        const address = currentAccountAddresses?.[COSMOS_CHAINS.find((item) => item.chainId === chainId)?.id || ''] || '';
        return { ...acc, [chainId]: address };
      }, {}),
    [currentAccountAddresses, skipRoute.data?.chain_ids],
  );

  const skipSwapTxParam = useMemo<SkipSwapTxParam | undefined>(() => {
    if (
      skipRoute.data &&
      skipRoute.data.chain_ids &&
      skipRoute.data.chain_ids.length > 0 &&
      skipRoute.data.operations &&
      skipRoute.data.operations.length > 0 &&
      slippage &&
      apiRequiredAddresses
    ) {
      return {
        ...skipRoute.data,
        affiliates,
        slippage,
        chainIdsToAddresses: apiRequiredAddresses,
      };
    }
    return undefined;
  }, [apiRequiredAddresses, skipRoute.data, affiliates, slippage]);

  const skipSwapTx = useSkipSwapTxSWR({
    swapTxParam: skipSwapTxParam,
  });

  const skipSwapTxMsgs = useMemo(
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
                revision_height: parsedMsg.timeout_height.revision_height || (0 as unknown as Long),
                revision_number: parsedMsg.timeout_height.revision_height || (0 as unknown as Long),
              },
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

  const clientState = useClientStateSWR({
    chain: COSMOS_CHAINS.find((item) => item.chainId === skipSwapTxMsgs.find((msg) => msg?.msg_type_url === 'cosmos-sdk/MsgTransfer')?.chain_id),
    channelId: skipSwapTxMsgs.find((item) => item?.msg_type_url === 'cosmos-sdk/MsgTransfer')?.msg.source_channel || '',
    port: skipSwapTxMsgs.find((item) => item?.msg_type_url === 'cosmos-sdk/MsgTransfer')?.msg.source_port || '',
  });

  const latestHeight = useMemo(
    () => clientState.data?.identified_client_state?.client_state?.latest_height,
    [clientState.data?.identified_client_state?.client_state?.latest_height],
  );

  const revisionHeight = useMemo(
    () => (latestHeight?.revision_height ? String(1000 + parseInt(latestHeight?.revision_height, 10)) : undefined),
    [latestHeight?.revision_height],
  );

  const revisionNumber = useMemo(() => latestHeight?.revision_number, [latestHeight?.revision_number]);

  const skipSwapAminoTxMsgs = useMemo(
    () =>
      skipSwapTxMsgs.map((item) => {
        if (item?.msg_type_url === 'cosmos-sdk/MsgTransfer') {
          return {
            ...item,
            msg: {
              ...item?.msg,
              timeout_height: {
                revision_height: revisionHeight || (0 as unknown as Long),
                revision_number: revisionNumber || (0 as unknown as Long),
              },
            },
          };
        }
        return item;
      }),
    [revisionHeight, revisionNumber, skipSwapTxMsgs],
  );

  const memoizedSkipSwapAminoTx = useMemo(() => {
    if (inputBaseAmount && gt(inputBaseAmount, '0') && account.data?.value.account_number && fromChain?.chainId && skipSwapTxMsgs.length > 0) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.default_node_info?.network ?? fromChain.chainId,
        fee: { amount: [{ amount: '1', denom: fromChain?.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: skipSwapAminoTxMsgs.map((item) => ({
          type: item?.msg_type_url || '',
          value: item?.msg || undefined,
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
    skipSwapTxMsgs.length,
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

  const skipSwapSimulate = useSimulateSWR({ chain: fromChain, txBytes: skipSwapProtoTx?.tx_bytes });

  const skipSwapSimulatedGas = useMemo(
    () => (skipSwapSimulate.data?.gas_info?.gas_used ? times(skipSwapSimulate.data.gas_info.gas_used, getDefaultAV(fromChain), 0) : undefined),
    [fromChain, skipSwapSimulate.data?.gas_info?.gas_used],
  );

  return { skipRoute, skipSwapTx, skipSwapAminoTx, skipSwapSimulatedGas, latestHeight };
}
