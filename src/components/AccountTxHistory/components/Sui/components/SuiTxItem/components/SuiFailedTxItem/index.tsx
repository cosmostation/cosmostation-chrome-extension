import { useTranslation } from 'react-i18next';

import TxDetail from '@/components/AccountTxHistory/components/Common/TxDetail';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { isUnixTimestamp } from '@/utils/date';

import { TitleContainer } from '../../../../styled';

type SuiFailedTxItemProps = {
  digest: string;
  coinId: string;
  timestampMs?: string | null;
};

export default function SuiFailedTxItem({ digest, timestampMs, coinId }: SuiFailedTxItemProps) {
  const { t } = useTranslation();

  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getSuiAccountAsset();

  const txDetailExplorerURL = (() => {
    if (currentAsset?.chain.explorer?.tx) {
      return currentAsset?.chain.explorer?.tx.replace('${hash}', digest || '');
    }

    if (currentAsset?.chain.explorer?.url) {
      return `${currentAsset?.chain.explorer?.url}/tx/${digest || ''}`;
    }

    return '';
  })();

  const formattedTimestamp = (() => {
    if (!timestampMs) {
      return '';
    }
    const normalizedTxTime = isUnixTimestamp(timestampMs) ? Number(timestampMs) : timestampMs;

    const date = new Date(normalizedTxTime);

    return `${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} :${date.getSeconds().toString().padStart(2, '0')}`;
  })();

  const detail = (() => {
    const title = t('components.AccountTxHistory.components.Sui.components.SuiTxItem.components.SuiFailedTxItem.index.failed');

    return {
      title,
    };
  })();

  return (
    <TxDetail
      onClick={() => window.open(txDetailExplorerURL)}
      disabled={!txDetailExplorerURL}
      leftTop={
        <TitleContainer>
          <Base1300Text variant="b2_M">{detail.title}</Base1300Text>
        </TitleContainer>
      }
      rightTop={<Base1000Text variant="h5n_M">-</Base1000Text>}
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
