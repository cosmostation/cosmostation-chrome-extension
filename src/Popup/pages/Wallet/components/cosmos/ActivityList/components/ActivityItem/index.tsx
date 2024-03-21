import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { COSMOS_TX_CONFIRMED_STATUS } from '~/constants/txConfirmedStatus';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { equal, gt, toDisplayDenomAmount } from '~/Popup/utils/big';
import { convertToLocales, getDisplayMaxDecimals } from '~/Popup/utils/common';
import { getDpCoin, getMsgType, getTxMsgs } from '~/Popup/utils/cosmos';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Activity } from '~/types/cosmos/activity';

import {
  BottomContainer,
  BottomLeftContainer,
  BottomRightContainer,
  Container,
  IndicatorIconContainer,
  StyledButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
  TopRightTextContainer,
} from './styled';

import Success16Icon from '~/images/icons/Check16.svg';
import Fail16Icon from '~/images/icons/Close16.svg';

type ActivityItemProps = {
  activity: Activity;
  chain: CosmosChain;
};

export default function ActivityItem({ activity, chain }: ActivityItemProps) {
  const { t } = useTranslation();

  const { explorerURL } = chain;
  const { extensionStorage } = useExtensionStorage();
  const { language } = extensionStorage;

  const assets = useAssetsSWR(chain);

  const { data } = activity;

  const accounts = useAccounts();

  const address = useMemo(
    () => accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '',
    [accounts.data, chain.id, extensionStorage.selectedAccountId],
  );

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/transactions/${data?.txhash || ''}` : ''), [data?.txhash, explorerURL]);

  const formattedTimestamp = useMemo(() => {
    if (!data?.timestamp) {
      return '';
    }
    const date = new Date(data?.timestamp);

    return date.toLocaleString(convertToLocales(language), {
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [data?.timestamp, language]);

  const isTxSuccess = useMemo(() => (data?.code !== undefined ? equal(data.code, COSMOS_TX_CONFIRMED_STATUS.CONFIRMED) : undefined), [data?.code]);

  const title = useMemo(() => {
    const activityMsgType = getMsgType(activity, address);

    const [baseMsgType, subMsgtype] = activityMsgType.split('.');

    const localizedKey = `pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.${baseMsgType}`;
    const additionalMessagesCount = String(getTxMsgs(activity).length - 1);

    return `${t(localizedKey)} ${subMsgtype || ''}${gt(additionalMessagesCount, '0') ? ` + ${additionalMessagesCount}` : ''}`;
  }, [activity, address, t]);

  const shortenedTxHash = useMemo(() => shorterAddress(activity.data?.txhash, 15), [activity]);

  const amountData = getDpCoin(activity, chain, address);

  const firstAmountData = useMemo(
    () => amountData?.[0] && assets.data.find((item) => item.denom === amountData[0].denom || item.origin_denom === amountData[0].denom),
    [amountData, assets.data],
  );

  const displayAmount = useMemo(
    () => (amountData?.[0] ? toDisplayDenomAmount(amountData[0].amount, firstAmountData?.decimals || 0) : '0'),
    [amountData, firstAmountData?.decimals],
  );

  const displayDenom = useMemo(() => firstAmountData?.symbol, [firstAmountData?.symbol]);

  return (
    <StyledButton onClick={() => window.open(txDetailExplorerURL)} disabled={!txDetailExplorerURL}>
      <Tooltip
        title={!txDetailExplorerURL ? t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.noExplorerURL') : ''}
        varient="error"
        placement="top"
        arrow
      >
        <Container>
          <TopContainer>
            <TopLeftContainer>
              <Typography variant="h5">{title}</Typography>
            </TopLeftContainer>
            <TopRightContainer>
              {isTxSuccess !== undefined && (
                <IndicatorIconContainer data-is-success={isTxSuccess}>{isTxSuccess ? <Success16Icon /> : <Fail16Icon />}</IndicatorIconContainer>
              )}
              <TopRightTextContainer>
                <Typography variant="h6">{shortenedTxHash}</Typography>
              </TopRightTextContainer>
            </TopRightContainer>
          </TopContainer>
          <BottomContainer>
            <BottomLeftContainer>
              <Typography variant="h6">{`${formattedTimestamp} (${activity.data?.height || ''})`}</Typography>
            </BottomLeftContainer>
            {gt(displayAmount, '0') && displayDenom && (
              <BottomRightContainer>
                <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(firstAmountData?.decimals || 0)}>
                  {displayAmount}
                </NumberText>
                <Typography variant="h6">{displayDenom}</Typography>
                <Typography variant="h6">{` ${amountData && amountData.length > 1 ? `+ ${amountData.length - 1}` : ''}`}</Typography>
              </BottomRightContainer>
            )}
          </BottomContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
