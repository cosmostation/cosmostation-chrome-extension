/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DetermineTxType } from '~/Popup/background/ethereum';
import { isAminoCustom, isAminoSend } from '~/Popup/utils/tendermint';
import type { EthereumChain, TendermintChain } from '~/types/chain';
import type { EthereumTx } from '~/types/ethereum/message';
import type { Msg } from '~/types/tendermint/amino';

export type TxMessageProps = { chain: EthereumChain; determineTxType: DetermineTxType; tx: EthereumTx };

export default function TxMessage({ chain, determineTxType, tx }: TxMessageProps) {
  return null;
}
