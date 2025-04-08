import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import type { AccountTx } from '@/types/bitcoin/txs';
import { getTimestampValue, isUnixTimestamp } from '@/utils/date';
import { gt, minus, plus, toDisplayDenomAmount } from '@/utils/numbers';
import { isEqualsIgnoringCase, shorterAddress } from '@/utils/string';

import { AmountContainer, SymbolText, TitleContainer } from './styled';
import TxDetail from '../../../Common/TxDetail';

type BitcoinTxItemProps = {
  tx: AccountTx;
  coinId: string;
};

export default function BitcoinTxItem({ tx, coinId }: BitcoinTxItemProps) {
  const { t } = useTranslation();

  const { getBitcoinAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getBitcoinAccountAsset();

  const address = currentAsset?.address.address || '';

  const { txid, status } = tx;

  const txDetailExplorerURL = (() => {
    if (currentAsset?.chain.explorer?.tx) {
      return currentAsset?.chain.explorer?.tx.replace('${hash}', txid || '');
    }

    if (currentAsset?.chain.explorer?.url) {
      return `${currentAsset?.chain.explorer?.url}/tx/${txid || ''}`;
    }

    return '';
  })();

  const formattedTimestamp = (() => {
    if (!status?.block_time) {
      return '';
    }

    const formattedBlockTime = typeof status.block_time === 'string' ? status.block_time : String(status.block_time);

    const normalizedTxTime = isUnixTimestamp(formattedBlockTime) ? getTimestampValue(formattedBlockTime) : formattedBlockTime;

    const date = new Date(normalizedTxTime);

    return `${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} :${date.getSeconds().toString().padStart(2, '0')}`;
  })();

  const filteredTxInput = tx.vin?.filter((item) => isEqualsIgnoringCase(item.prevout?.scriptpubkey_address, address));
  const totalInputAmount = filteredTxInput?.reduce((acc, item) => plus(acc, item.prevout?.value || '0'), '0') || '0';

  const filteredTxOuput = tx.vout?.filter((item) => isEqualsIgnoringCase(item.scriptpubkey_address, address));
  const totalOutputAmount = filteredTxOuput?.reduce((acc, item) => plus(acc, item.value || '0'), '0') || '0';

  const feeAmount = tx.fee ? String(tx.fee) : '0';

  const detail = (() => {
    if (filteredTxInput?.length || 0 > 0) {
      const baseAmount = minus(minus(totalInputAmount, totalOutputAmount), feeAmount);
      const displayAmount = toDisplayDenomAmount(baseAmount, currentAsset?.asset.decimals || 0);

      const subTitle = (() => {
        const toAddresses = tx.vout?.filter((item) => !isEqualsIgnoringCase(item.scriptpubkey_address, address)).map((item) => item.scriptpubkey_address);

        return `To: ${shorterAddress(toAddresses?.[0] || '', 16)}`;
      })();

      return {
        title: t('components.AccountTxHistory.components.Bitcoin.components.BitcoinTxItem.index.sent'),
        subTitle,
        amount: displayAmount,
      };
    }

    const subTitle = (() => {
      const fromAddresses = tx.vin?.map((item) => item.prevout?.scriptpubkey_address);

      return `From: ${shorterAddress(fromAddresses?.[0] || '', 16)}`;
    })();
    return {
      title: t('components.AccountTxHistory.components.Bitcoin.components.BitcoinTxItem.index.received'),
      subTitle,
      amount: toDisplayDenomAmount(totalOutputAmount, currentAsset?.asset.decimals || 0),
    };
  })();

  return (
    <TxDetail
      onClick={() => window.open(txDetailExplorerURL)}
      disabled={!txDetailExplorerURL}
      leftTop={
        <TitleContainer>
          <Base1300Text variant="b2_M">{detail.title}</Base1300Text>
          &nbsp;
        </TitleContainer>
      }
      rightTop={
        detail.amount && gt(detail.amount, '0') ? (
          <AmountContainer>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {detail.amount}
            </BalanceDisplay>
            &nbsp;
            <SymbolText variant="b4_M">{currentAsset?.asset.symbol}</SymbolText>
          </AmountContainer>
        ) : (
          <Base1000Text variant="h5n_M">-</Base1000Text>
        )
      }
      leftBottom={<Base1000Text variant="b4_M">{detail.subTitle || '-'}</Base1000Text>}
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
