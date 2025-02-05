import type { AnalyzedTransaction } from '@/types/sui/parseTx';

import SuiBasicTxItem from './components/SuiBasicTxItem';
import SuiDefaultTxItem from './components/SuiDefaultTxItem';
import SuiFailedTxItem from './components/SuiFailedTxItem';
import SuiFaucetTxItem from './components/SuiFaucetTxItem';
import SuiMoveCallsTxItem from './components/SuiMoveCallsTxItem';
import SuiSendingTxItem from './components/SuiSendingTxItem';
import SuiStakingTxItem from './components/SuiStakingTxItem';

type SuiTxItemProps = {
  tx: AnalyzedTransaction;
  coinId: string;
};

export default function SuiTxItem({ tx, coinId }: SuiTxItemProps) {
  if (tx.important.faucet) {
    return <SuiFaucetTxItem tx={tx.important.faucet} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.important.staking) {
    return <SuiStakingTxItem tx={tx.important.staking[0]} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} isTxFail={tx.status === 'failure'} />;
  }

  if (tx.important.moveCalls) {
    return <SuiMoveCallsTxItem tx={tx.important.moveCalls[0]} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.important.sending) {
    return <SuiSendingTxItem tx={tx.important.sending[0]} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.important.basic) {
    return <SuiBasicTxItem tx={tx.important.basic} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.status === 'failure') {
    return <SuiFailedTxItem digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  return <SuiDefaultTxItem digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
}
