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
import type { MsgTransfer, SignAminoDoc } from '~/types/cosmos/amino';
import type { AssetV3 as CosmosAssetV3 } from '~/types/cosmos/asset';
import type { Affiliates } from '~/types/swap/skip';

import { type SkipRouteProps, useSkipRouteSWR } from './SWR/useSkipRouteSWR';
import type { SkipSwapTxParam } from './SWR/useSkipSwapTxSWR';
import { useSkipSwapTxSWR } from './SWR/useSkipSwapTxSWR';
import { useAccounts } from '../../cache/useAccounts';
import { useAccountSWR } from '../../cosmos/useAccountSWR';
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
  const { currentPassword } = useCurrentPassword();

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

  // NOTE 모든 TX가 IBC Send일 경우에만 사용 가능, if not이면 분기 필요
  const memoizedSkipSwapAminoTx = useMemo<SignAminoDoc<MsgTransfer> | undefined>(() => {
    if (inputBaseAmount && gt(inputBaseAmount, '0') && account.data?.value.account_number && fromChain?.chainId && skipSwapTxMsgs.length > 0) {
      const sequence = String(account.data?.value.sequence || '0');

      return {
        account_number: String(account.data.value.account_number),
        sequence,
        chain_id: nodeInfo.data?.default_node_info?.network ?? fromChain.chainId,
        fee: { amount: [{ amount: '1', denom: fromChain?.baseDenom }], gas: COSMOS_DEFAULT_SWAP_GAS },
        memo: '',
        msgs: skipSwapTxMsgs.map((item) => ({
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
    skipSwapTxMsgs,
  ]);

  // NOTE 필요한가?
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
    if (memoizedSkipSwapAminoTx && fromChain) {
      const skipSwapSimulatedAminoTx = {
        account_number: memoizedSkipSwapAminoTx.account_number,
        sequence: memoizedSkipSwapAminoTx.sequence,
        chain_id: memoizedSkipSwapAminoTx.chain_id,
        fee: {
          amount: [{ denom: fromChain.baseDenom, amount: ceil(times(skipSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS, fromChain.gasRate.low || '0')) }],
          gas: skipSwapSimulatedGas || COSMOS_DEFAULT_SWAP_GAS,
        },
        memo: '',
        msgs: memoizedSkipSwapAminoTx.msgs,
      };

      const keyPair = getKeyPair(currentAccount, fromChain, currentPassword);

      const base64PublicKey = keyPair ? Buffer.from(keyPair.publicKey).toString('base64') : '';

      const publicKeyType = getPublicKeyType(fromChain);

      const pTx = protoTx(skipSwapSimulatedAminoTx, '', { type: publicKeyType, value: base64PublicKey }, cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT);

      return pTx
        ? {
            chain_id: fromChain.chainId,
            account_number: memoizedSkipSwapAminoTx.account_number,
            auth_info_bytes: Buffer.from(pTx.authInfoBytes).toString('hex') as unknown as Uint8Array,
            body_bytes: Buffer.from(pTx.txBodyBytes).toString('hex') as unknown as Uint8Array,
          }
        : undefined;
    }
    return undefined;
  }, [currentAccount, currentPassword, fromChain, memoizedSkipSwapAminoTx, skipSwapSimulatedGas]);

  return { skipRoute, skipSwapTx, memoizedSkipSwapAminoTx, memoizedSkipSwapDirectTx, skipSwapSimulatedGas };
}
