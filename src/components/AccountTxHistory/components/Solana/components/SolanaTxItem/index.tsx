import { useTranslation } from 'react-i18next';
import type { ConfirmedSignatureInfo } from '@solana/web3.js';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { getLocalTime } from '@/utils/solana/signature';

import TxDetail from '../../../Common/TxDetail';

type SolanaTxItemProps = {
  tx: ConfirmedSignatureInfo;
  coinId: string;
};

export default function SolanaTxItem({ tx, coinId }: SolanaTxItemProps) {
  const { t } = useTranslation();

  const { getSolanaAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getSolanaAccountAsset();

  const { signature } = tx || {};

  const txDetailExplorerURL = (() => {
    if (currentAsset?.chain.explorer?.tx) {
      return currentAsset?.chain.explorer?.tx.replace('${hash}', signature || '');
    }

    if (currentAsset?.chain.explorer?.url) {
      return `${currentAsset?.chain.explorer?.url}/tx/${signature || ''}`;
    }

    return '';
  })();

  const formattedTimestamp = getLocalTime(String(tx.blockTime));

  const title = (() => {
    return t('components.AccountTxHistory.components.Solana.components.SolanaTxItem.index.transaction');
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
