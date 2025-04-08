import { useTranslation } from 'react-i18next';

import TxDetail from '@/components/AccountTxHistory/components/Common/TxDetail';
import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import type { FaucetTransactionInfo } from '@/types/sui/parseTx';
import { isUnixTimestamp } from '@/utils/date';
import { toDisplayDenomAmount } from '@/utils/numbers';

import { AmountContainer, SymbolText } from './styled';
import { TitleContainer } from '../../../../styled';

type SuiFaucetTxItemProps = {
  tx: FaucetTransactionInfo;
  digest: string;
  coinId: string;
  timestampMs?: string | null;
};

export default function SuiFaucetTxItem({ tx: faucetTransactionInfo, digest, timestampMs, coinId }: SuiFaucetTxItemProps) {
  const { t } = useTranslation();

  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getSuiAccountAsset();

  const { amount } = faucetTransactionInfo;

  const decimals = currentAsset?.asset.decimals || 6;
  const symbol = currentAsset?.asset.symbol || '';

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
    const formattedSymbol = symbol && symbol.length > 10 ? `${symbol.slice(0, 10)}...` : symbol;

    const title = t('components.AccountTxHistory.components.Sui.components.SuiTxItem.components.SuiFaucetTxItem.index.faucet');

    const displayAmount = amount && toDisplayDenomAmount(amount, decimals);
    return {
      title,
      amount: displayAmount
        ? {
            displayAmount,
            symbol: formattedSymbol,
          }
        : undefined,
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
      rightTop={
        detail.amount ? (
          <AmountContainer>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {detail.amount.displayAmount}
            </BalanceDisplay>
            &nbsp;
            <SymbolText variant="b4_M">{detail.amount.symbol}</SymbolText>
          </AmountContainer>
        ) : (
          <Base1000Text variant="h5n_M">-</Base1000Text>
        )
      }
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
