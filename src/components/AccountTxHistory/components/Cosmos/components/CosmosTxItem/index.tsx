import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinList } from '@/hooks/useCoinList';
import type { AccountTx } from '@/types/cosmos/txs';
import { getDpCoin, getMsgDetail, getMsgType, getTxMsgs } from '@/utils/cosmos/txParse';
import { gt, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

import { AmountContainer, SymbolText } from './styled';
import TxDetail from '../../../Common/TxDetail';

type CosmosTxItemProps = {
  tx: AccountTx;
  coinId: string;
};

export default function CosmosTxItem({ tx, coinId }: CosmosTxItemProps) {
  const { t, i18n } = useTranslation();

  const { data: coinList } = useCoinList();

  const { data: accountAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  const currentAsset = accountAssets?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const address = currentAsset?.address.address || '';

  const mainAssetDenom = currentAsset?.chain.mainAssetDenom || '';

  const { data } = tx;

  const txDetailExplorerURL = (() => {
    if (currentAsset?.chain.explorer?.tx) {
      return currentAsset?.chain.explorer?.tx.replace('${hash}', data?.txhash || '');
    }

    if (currentAsset?.chain.explorer?.url) {
      return `${currentAsset?.chain.explorer?.url}/transactions/${data?.txhash || ''}`;
    }

    return '';
  })();

  const formattedTimestamp = (() => {
    if (!data?.timestamp) {
      return '';
    }
    const date = new Date(data?.timestamp);

    return `${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} :${date.getSeconds().toString().padStart(2, '0')}`;
  })();

  const title = (() => {
    const txMsgType = getMsgType(tx, address);

    const [baseMsgType, subMsgtype] = txMsgType.split('.');

    const localizedKey = `components.AccountTxHistory.components.Cosmos.components.CosmosTxItem.index.${baseMsgType}`;

    const mainTitle = i18n.exists(localizedKey) ? t(localizedKey) : baseMsgType;

    const additionalMessagesCount = String(getTxMsgs(tx).length - 1);

    return `${mainTitle} ${subMsgtype || ''}${gt(additionalMessagesCount, '0') ? ` + ${additionalMessagesCount}` : ''}`;
  })();

  const txDetail = getMsgDetail(tx, address) || '-';

  const msgSendDetail = (() => {
    const splitted = txDetail.split(':');
    const isMsgSend = splitted[0].trim() === 'To' || splitted[0].trim() === 'From';

    if (isMsgSend) {
      return {
        prefix: splitted[0].trim(),
        address: splitted[1].trim(),
      };
    }

    return undefined;
  })();

  const amountData = getDpCoin(tx, mainAssetDenom, address);

  const firstAmountData = amountData?.[0] && coinList?.cosmosAssets.find((item) => item.id === amountData[0].denom);

  const displayAmount = amountData?.[0] && toDisplayDenomAmount(amountData[0].amount, firstAmountData?.decimals || 0);

  const symbol = firstAmountData?.symbol;
  const symbolColor = firstAmountData?.color;

  return (
    <TxDetail
      onClick={() => window.open(txDetailExplorerURL, '_blank')}
      disabled={!txDetailExplorerURL}
      leftTop={<Base1300Text variant="b2_M">{title}</Base1300Text>}
      rightTop={
        <AmountContainer>
          {displayAmount ? (
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {displayAmount}
            </BalanceDisplay>
          ) : (
            <Base1000Text variant="h5n_M">-</Base1000Text>
          )}
          &nbsp;
          <SymbolText variant="b4_M" data-symbol-color={symbolColor}>
            {symbol}
          </SymbolText>
        </AmountContainer>
      }
      leftBottom={
        msgSendDetail ? (
          <Base1000Text variant="b4_M">
            {`${msgSendDetail.prefix} : `}
            <Base1000Text variant="b4_R">{msgSendDetail.address}</Base1000Text>
          </Base1000Text>
        ) : (
          <Base1000Text variant="b4_M">{txDetail}</Base1000Text>
        )
      }
      rightBottom={<Base1000Text variant="h7n_R">{formattedTimestamp}</Base1000Text>}
    />
  );
}
