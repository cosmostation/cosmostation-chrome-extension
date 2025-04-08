import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import type { AccountTx } from '@/types/evm/txs';
import { isUnixTimestamp } from '@/utils/date';
import { gt } from '@/utils/numbers';
import { isEqualsIgnoringCase } from '@/utils/string';

import { AmountContainer, SymbolText } from './styled';
import TxDetail from '../../../Common/TxDetail';

type EVMTxItemProps = {
  tx: AccountTx;
  coinId: string;
};

export default function EVMTxItem({ tx, coinId }: EVMTxItemProps) {
  const { t } = useTranslation();

  const { getEVMAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getEVMAccountAsset();

  const address = currentAsset?.address.address || '';

  const { txHash, txTime, symbol, amount, from, to } = tx;

  const txDetailExplorerURL = (() => {
    if (currentAsset?.chain.explorer?.tx) {
      return currentAsset?.chain.explorer?.tx.replace('${hash}', txHash || '');
    }

    if (currentAsset?.chain.explorer?.url) {
      return `${currentAsset?.chain.explorer?.url}/tx/${txHash || ''}`;
    }

    return '';
  })();

  const formattedTimestamp = (() => {
    if (!txTime) {
      return '';
    }
    const normalizedTxTime = isUnixTimestamp(txTime) ? Number(txTime) : txTime;

    const date = new Date(normalizedTxTime);

    return `${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} :${date.getSeconds().toString().padStart(2, '0')}`;
  })();

  const title = (() => {
    if (from?.length && from.some((item) => isEqualsIgnoringCase(item.address, address))) {
      return t('components.AccountTxHistory.components.EVM.components.EVMTxItem.index.sent');
    }
    if (to?.length && to.some((item) => isEqualsIgnoringCase(item.address, address))) {
      return t('components.AccountTxHistory.components.EVM.components.EVMTxItem.index.received');
    }

    return t('components.AccountTxHistory.components.EVM.components.EVMTxItem.index.transaction');
  })();

  const formattedSymbol = (() => {
    if (!symbol) return undefined;

    if (symbol.length > 10) return `${symbol.slice(0, 10)}...`;

    return symbol;
  })();

  return (
    <TxDetail
      onClick={() => window.open(txDetailExplorerURL)}
      disabled={!txDetailExplorerURL}
      leftTop={<Base1300Text variant="b2_M">{title}</Base1300Text>}
      rightTop={
        amount && gt(amount, '0') ? (
          <AmountContainer>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {amount}
            </BalanceDisplay>
            &nbsp;
            <SymbolText variant="b4_M">{formattedSymbol}</SymbolText>
          </AmountContainer>
        ) : (
          <Base1000Text variant="h5n_M">-</Base1000Text>
        )
      }
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
