import { useMemo } from 'react';
import { useDebounce } from 'use-debounce';

import { COSMOS_CHAINS, COSMOS_DEFAULT_SWAP_GAS } from '~/constants/chain';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { ceil, gt, times } from '~/Popup/utils/big';
import { getKeyPair } from '~/Popup/utils/common';
import { getDefaultAV, getPublicKeyType } from '~/Popup/utils/cosmos';
import { convertDirectMsgTypeToAminoMsgType, protoTx, protoTxBytes } from '~/Popup/utils/proto';
import { cosmos } from '~/proto/cosmos-v0.44.2.js';
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
  const { currentPassword } = useCurrentPassword();
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

  const skipSwapDirectTxMsgs = useMemo(
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

  // TODO 그냥 빼버려, 이슈 생기면 그때 핸들ㄹ이
  const isSignDirectMode = useMemo(() => !(skipSwapDirectTxMsgs.length > 1), [skipSwapDirectTxMsgs.length]);

  const clientState = useClientStateSWR({
    chain: COSMOS_CHAINS.find((item) => item.chainId === skipSwapDirectTxMsgs.find((msg) => msg?.msg_type_url === 'cosmos-sdk/MsgTransfer')?.chain_id),
    channelId: skipSwapDirectTxMsgs.find((item) => item?.msg_type_url === 'cosmos-sdk/MsgTransfer')?.msg.source_channel || '',
    port: skipSwapDirectTxMsgs.find((item) => item?.msg_type_url === 'cosmos-sdk/MsgTransfer')?.msg.source_port || '',
  });

  const latestHeight = useMemo(
    () => clientState.data?.identified_client_state?.client_state?.latest_height,
    [clientState.data?.identified_client_state?.client_state?.latest_height],
  );

  const revisionHeight = useMemo(
    () => (latestHeight?.revision_height ? String(1000 + parseInt(latestHeight?.revision_height, 10)) : '0'),
    [latestHeight?.revision_height],
  );

  const revisionNumber = useMemo(() => latestHeight?.revision_number || '0', [latestHeight?.revision_number]);

  // NOTE msg가 2개 이상일때는 다이렉트 사인 모드로 전환하도록
  // NOTE 전반적으로 코드가 안읽힘. 리팩토링 필요
  const skipSwapAminoTxMsgs = useMemo(
    () =>
      skipSwapDirectTxMsgs.map((item) => {
        if (item?.msg_type_url === 'cosmos-sdk/MsgTransfer' && latestHeight) {
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
    [latestHeight, revisionHeight, revisionNumber, skipSwapDirectTxMsgs],
  );

  const memoizedSkipSwapAminoTx = useMemo(() => {
    if (inputBaseAmount && gt(inputBaseAmount, '0') && account.data?.value.account_number && fromChain?.chainId && skipSwapDirectTxMsgs.length > 0) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.default_node_info?.network ?? fromChain.chainId,
        fee: { amount: [{ amount: '1', denom: fromChain?.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: isSignDirectMode
          ? skipSwapDirectTxMsgs.map((item) => ({
              type: item?.msg_type_url || '',
              value: item?.msg || undefined,
            }))
          : skipSwapAminoTxMsgs.map((item) => ({
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
    skipSwapAminoTxMsgs,
    skipSwapDirectTxMsgs,
    isSignDirectMode,
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

  const memoizedSkipSwapDirectTx = useMemo(() => {
    if (skipSwapAminoTx && fromChain) {
      const skipSwapSimulatedAminoTx = {
        account_number: skipSwapAminoTx.account_number,
        sequence: skipSwapAminoTx.sequence,
        chain_id: skipSwapAminoTx.chain_id,
        fee: {
          amount: [{ denom: fromChain.baseDenom, amount: ceil(times(skipSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS, fromChain.gasRate.low || '0')) }],
          gas: skipSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS,
        },
        memo: '',
        msgs: skipSwapAminoTx.msgs,
      };

      const keyPair = getKeyPair(currentAccount, fromChain, currentPassword);

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey).toString('base64') : '';

      const publicKeyType = getPublicKeyType(fromChain);

      const pTx = protoTx(skipSwapSimulatedAminoTx, '', { type: publicKeyType, value: base64PublicKey }, cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT);

      return pTx
        ? {
            chain_id: fromChain.chainId,
            account_number: skipSwapAminoTx.account_number,
            auth_info_bytes: Buffer.from(pTx.authInfoBytes).toString('hex') as unknown as Uint8Array,
            body_bytes: Buffer.from(pTx.txBodyBytes).toString('hex') as unknown as Uint8Array,
          }
        : undefined;
    }
    return undefined;
  }, [currentAccount, currentPassword, fromChain, skipSwapAminoTx, skipSwapSimulatedGas]);

  return { skipRoute, skipSwapTx, skipSwapAminoTx, skipSwapSimulatedGas, memoizedSkipSwapDirectTx, isSignDirectMode };
}
