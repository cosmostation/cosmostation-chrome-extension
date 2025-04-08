import { useTranslation } from 'react-i18next';
import { isPendingTransactionResponse, type TransactionResponse } from '@aptos-labs/ts-sdk';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getLocalTime } from '@/utils/aptos/tx';

import { StatusContainer, TitleContainer } from './styled';
import TxDetail from '../../../Common/TxDetail';

type AptosPendingTxItemProps = {
  tx: TransactionResponse;
  coinId: string;
};

export default function AptosPendingTxItem({ tx, coinId }: AptosPendingTxItemProps) {
  const { t } = useTranslation();

  const { getAptosAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getAptosAccountAsset();

  const pendingTx = isPendingTransactionResponse(tx) ? tx : null;

  const { hash } = pendingTx || {};

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
    return t('components.AccountTxHistory.components.Aptos.components.AptosPendingTxItem.index.transaction');
  })();

  return (
    <TxDetail
      onClick={() => window.open(txDetailExplorerURL)}
      disabled={!txDetailExplorerURL}
      leftTop={
        <TitleContainer>
          <Base1300Text variant="b2_M">{title}</Base1300Text>
          &nbsp;
          <StatusContainer variant="b2_M">{t('components.AccountTxHistory.components.Aptos.components.AptosPendingTxItem.index.pending')}</StatusContainer>
        </TitleContainer>
      }
      rightTop={<Base1000Text variant="h5n_M">-</Base1000Text>}
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
