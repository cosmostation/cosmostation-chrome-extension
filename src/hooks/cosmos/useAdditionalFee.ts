import { useMemo } from 'react';

import type { CosmosChain } from '@/types/chain';
import type { Msg as AminoMsg } from '@/types/cosmos/amino';
import type { Msg as DirectMsg } from '@/types/cosmos/direct';
import { isAminoExecuteEurekaContract } from '@/utils/cosmos/msg';
import { isDirectExecuteEurekaContract } from '@/utils/cosmos/proto';
import { getCoinId } from '@/utils/queryParamGenerator';

import { useCoinList } from '../useCoinList';

type UseAdditionalFeeProps = {
  chain: CosmosChain;
  msgs?: DirectMsg[] | AminoMsg[];
  currentStep: number;
};

function isDirectMsg(msg: DirectMsg | AminoMsg): msg is DirectMsg {
  return 'type_url' in msg;
}

function isAminoMsg(msg: DirectMsg | AminoMsg): msg is AminoMsg {
  return 'type' in msg;
}

function isEurekaMsg(chain: CosmosChain, msg: DirectMsg | AminoMsg) {
  return (isDirectMsg(msg) && isDirectExecuteEurekaContract(chain, msg)) || (isAminoMsg(msg) && isAminoExecuteEurekaContract(chain, msg));
}

export function useAdditionalFee({ chain, msgs, currentStep }: UseAdditionalFeeProps) {
  const { data: coinList } = useCoinList();

  const currentMsg = msgs?.[currentStep];

  const formattedAdditionalFee = useMemo(() => {
    if (!currentMsg) return currentMsg;

    if (isEurekaMsg(chain, currentMsg)) {
      const eurekaFee = currentMsg.value.msg.action.action.ibc_transfer.ibc_info.eureka_fee.coin;

      const targetCoin = coinList?.cosmosAssets.find((item) => item.id === eurekaFee.denom && item.chain === chain.id);

      return [
        {
          label: 'Eureka Fee',
          feeAmount: eurekaFee.amount,
          feeCoinId: getCoinId({ id: targetCoin ? targetCoin.id : eurekaFee.denom, chainId: chain.id, chainType: chain.chainType }),
        },
      ];
    }

    return undefined;
  }, [chain, coinList?.cosmosAssets, currentMsg]);

  return formattedAdditionalFee;
}
