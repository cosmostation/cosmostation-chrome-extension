import { useMemo } from 'react';
import { Typography } from '@mui/material';

import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAssetsSWR } from '~/Popup/hooks/SWR/cosmos/useAssetsSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt, toDisplayDenomAmount } from '~/Popup/utils/big';
import { convertToLocales } from '~/Popup/utils/common';
import { getDpCoin, getMsgType } from '~/Popup/utils/cosmos';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Activity } from '~/types/cosmos/activity';

import {
  Container,
  LeftContainer,
  LeftTextContainer,
  LeftTextSubtitleContainer,
  LeftTextTitleContainer,
  RightContainer,
  RightTextContainer,
  StyledButton,
} from './styled';

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
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [data?.timestamp, language]);

  const title = useMemo(() => getMsgType(activity, address), [activity, address]);

  const shortenedTxHash = useMemo(() => shorterAddress(activity.data?.txhash), [activity]);

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
          <LeftContainer>
            <LeftTextContainer>
              <LeftTextTitleContainer>
                <Typography variant="h5">{title}</Typography>
              </LeftTextTitleContainer>
              <LeftTextSubtitleContainer>
                <Typography variant="h6">{shortenedTxHash}</Typography>
              </LeftTextSubtitleContainer>
              <LeftTextSubtitleContainer>
                <Typography variant="h6">{formattedTimestamp}</Typography>
              </LeftTextSubtitleContainer>
            </LeftTextContainer>
          </LeftContainer>
          <RightContainer>
            {gt(displayAmount, '0') && displayDenom && (
              <RightTextContainer>
                <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {displayAmount}
                </NumberText>
                <Typography variant="h6">{displayDenom}</Typography>
                <Typography variant="h6">{` ${amountData && amountData.length > 1 ? `+ ${amountData.length - 1}` : ''}`}</Typography>
              </RightTextContainer>
            )}
          </RightContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
