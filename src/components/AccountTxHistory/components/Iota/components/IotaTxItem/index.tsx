import type { AnalyzedTransaction } from '@/types/iota/parseTx';

import IotaBasicTxItem from './components/IotaBasicTxItem';
import IotaDefaultTxItem from './components/IotaDefaultTxItem';
import IotaFailedTxItem from './components/IotaFailedTxItem';
import IotaFaucetTxItem from './components/IotaFaucetTxItem';
import IotaMoveCallsTxItem from './components/IotaMoveCallsTxItem';
import IotaSendingTxItem from './components/IotaSendingTxItem';
import IotaStakingTxItem from './components/IotaStakingTxItem';

type IotaTxItemProps = {
  tx: AnalyzedTransaction;
  coinId: string;
};

export default function IotaTxItem({ tx, coinId }: IotaTxItemProps) {
  if (tx.important.faucet) {
    return <IotaFaucetTxItem tx={tx.important.faucet} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.important.staking) {
    return (
      <IotaStakingTxItem tx={tx.important.staking[0]} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} isTxFail={tx.status === 'failure'} />
    );
  }

  if (tx.important.moveCalls) {
    return <IotaMoveCallsTxItem tx={tx.important.moveCalls[0]} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.important.sending) {
    return <IotaSendingTxItem tx={tx.important.sending[0]} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.important.basic) {
    return <IotaBasicTxItem tx={tx.important.basic} digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  if (tx.status === 'failure') {
    return <IotaFailedTxItem digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
  }

  return <IotaDefaultTxItem digest={tx.digest} timestampMs={tx.timestampMs} coinId={coinId} />;
}
