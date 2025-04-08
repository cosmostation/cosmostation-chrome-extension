import { useTranslation } from 'react-i18next';
import type { TransactionResponse } from '@aptos-labs/ts-sdk';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getLocalTime, isCommittedTransactionResponse } from '@/utils/aptos/tx';

import TxDetail from '../../../Common/TxDetail';

type AptosTxItemProps = {
  tx: TransactionResponse;
  coinId: string;
};

export default function AptosTxItem({ tx, coinId }: AptosTxItemProps) {
  const { t } = useTranslation();

  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getAptosAccountAsset();

  const committetedTx = isCommittedTransactionResponse(tx);

  const { hash } = committetedTx || {};

  const txDetailExplorerURL = (() => {
    if (currentAsset?.chain.explorer?.tx) {
      return currentAsset?.chain.explorer?.tx.replace('${hash}', hash || '');
    }

    if (currentAsset?.chain.explorer?.url) {
      return `${currentAsset?.chain.explorer?.url}/tx/${hash || ''}`;
    }

    return '';
  })();

  const formattedTimestamp = getLocalTime(tx);

  const title = (() => {
    return t('components.AccountTxHistory.components.Aptos.components.AptosTxItem.index.transaction');
  })();

  return (
    <TxDetail
      onClick={() => window.open(txDetailExplorerURL)}
      disabled={!txDetailExplorerURL}
      leftTop={<Base1300Text variant="b2_M">{title}</Base1300Text>}
      rightTop={<Base1000Text variant="h5n_M">-</Base1000Text>}
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
