import { useTranslation } from 'react-i18next';

import TxDetail from '@/components/AccountTxHistory/components/Common/TxDetail';
import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { IOTA_COIN_TYPE, IOTA_TOKEN_TEMPORARY_DECIMALS } from '@/constants/iota';
import { useGetCoinMetadata } from '@/hooks/iota/useGetCoinMetadata';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import type { SendTransactionInfo } from '@/types/iota/parseTx';
import { isUnixTimestamp } from '@/utils/date';
import { toDisplayDenomAmount } from '@/utils/numbers';
import { shorterAddress } from '@/utils/string';

import { AmountContainer, SymbolText } from './styled';
import { TitleContainer } from '../../../../styled';

type IotaSendingTxItemProps = {
  tx: SendTransactionInfo;
  digest: string;
  coinId: string;
  timestampMs?: string | null;
};

export default function IotaSendingTxItem({ tx, digest, timestampMs, coinId }: IotaSendingTxItemProps) {
  const { t } = useTranslation();

  const { getIotaAccountAsset } = useGetAccountAsset({ coinId });
  const currentAsset = getIotaAccountAsset();

  const sendingTransactionInfo = tx;

  const { isSender, sender, recipient, coinAmount, coinType } = sendingTransactionInfo;

  const { data: coinMetaData } = useGetCoinMetadata({ coinType: coinType === IOTA_COIN_TYPE ? '' : coinType || '', coinId });

  const decimals = coinMetaData?.result?.decimals || IOTA_TOKEN_TEMPORARY_DECIMALS;
  const symbol = coinMetaData?.result?.symbol || coinType?.split('::')[2] || '';

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

    const sendingObject = sendingTransactionInfo.objectId ? 'NFT' : formattedSymbol;

    const title = isSender
      ? t('components.AccountTxHistory.components.Iota.components.IotaTxItem.components.IotaSendingTxItem.index.sent', {
          object: sendingObject,
        })
      : t('components.AccountTxHistory.components.Iota.components.IotaTxItem.components.IotaSendingTxItem.index.received', {
          object: sendingObject,
        });

    const otherAddress = isSender ? recipient : sender;
    const formattedOtherAddress = shorterAddress(otherAddress, 16);

    const subTitle = isSender
      ? t('components.AccountTxHistory.components.Iota.components.IotaTxItem.components.IotaSendingTxItem.index.to', {
          address: formattedOtherAddress,
        })
      : t('components.AccountTxHistory.components.Iota.components.IotaTxItem.components.IotaSendingTxItem.index.from', {
          address: formattedOtherAddress,
        });

    const displayAmount = coinAmount && toDisplayDenomAmount(coinAmount, decimals);
    const balanceChangedMark = isSender ? `-` : `+`;
    return {
      title,
      subTitle,
      amount: displayAmount
        ? {
            displayAmount,
            symbol: formattedSymbol,
            balanceChangedMark,
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
            <Base1300Text variant="h5n_M">{detail.amount.balanceChangedMark}</Base1300Text>
            &nbsp;
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
      leftBottom={<Base1000Text variant="b4_M">{detail.subTitle}</Base1000Text>}
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
