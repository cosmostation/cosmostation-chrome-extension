import { useMemo } from 'react';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { gt } from '~/Popup/utils/big';
import { convertDirectMsgTypeToAminoMsgType } from '~/Popup/utils/proto';
import type { CosmosChain } from '~/types/chain';
import type { MsgSwap, SignAminoDoc } from '~/types/cosmos/amino';
import type { AssetV3 as CosmosAssetV3 } from '~/types/cosmos/asset';
import type { Affiliates } from '~/types/swap/skip';

import { type SkipRouteProps, useSkipRouteSWR } from './SWR/useSkipRouteSWR';
import type { SkipSwapTxParam } from './SWR/useSkipSwapTxSWR';
import { useSkipSwapTxSWR } from './SWR/useSkipSwapTxSWR';
import { useAccounts } from '../../cache/useAccounts';
import { useAccountSWR } from '../../cosmos/useAccountSWR';
import { useNodeInfoSWR } from '../../cosmos/useNodeinfoSWR';

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

  const msg = useMemo(
    () =>
      skipSwapTx.data?.msgs.map((item) => {
        const parsedMsg = JSON.parse(item.msg) as MsgSwap;

        return {
          chain_id: item.chain_id,
          path: item.path,
          msg_type_url: convertDirectMsgTypeToAminoMsgType(item.msg_type_url) || 'cosmos-sdk/MsgTransfer',
          msg: {
            source_port: parsedMsg.source_port,
            source_channel: parsedMsg.source_channel,
            token: parsedMsg.token,
            sender: parsedMsg.sender,
            receiver: parsedMsg.receiver,
            timeout_height: {
              revision_height: parsedMsg.timeout_height?.revision_height || '0',
              revision_number: parsedMsg.timeout_height?.revision_number || '0',
            },
            timeout_timestamp: parsedMsg.timeout_timestamp,
            memo: parsedMsg.memo,
          },
        };
      }) || [],
    [skipSwapTx.data?.msgs],
  );

  const memoizedSkipSwapAminoTx = useMemo<SignAminoDoc<MsgSwap> | undefined>(() => {
    if (inputBaseAmount && gt(inputBaseAmount, '0') && account.data?.value.account_number && fromChain?.chainId && msg.length > 0) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.default_node_info?.network ?? fromChain.chainId,
        fee: { amount: [{ amount: '1', denom: fromChain?.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: msg.map((item) => ({
          type: item.msg_type_url,
          value: item.msg,
        })),
      };
    }

    return undefined;
  }, [
    inputBaseAmount,
    account.data?.value.account_number,
    account.data?.value.sequence,
    nodeInfo.data?.default_node_info?.network,
    fromChain?.chainId,
    fromChain?.baseDenom,
    msg,
  ]);

  return { skipRoute, skipSwapTx, memoizedSkipSwapAminoTx };
}
