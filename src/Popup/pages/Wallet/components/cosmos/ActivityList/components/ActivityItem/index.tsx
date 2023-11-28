import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { COSMOS_ACTIVITY_TYPE } from '~/constants/extensionStorage';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { gt } from '~/Popup/utils/big';
import { convertToLocales } from '~/Popup/utils/common';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { ActivityData } from '~/types/extensionStorage';

import {
  Container,
  LeftContainer,
  LeftIconContainer,
  LeftTextContainer,
  LeftTextSubtitleContainer,
  LeftTextTitleContainer,
  RightContainer,
  RightTextContainer,
  StyledButton,
} from './styled';

import Commission24Icon from '~/images/icons/Commission24.svg';
import Contract24Icon from '~/images/icons/Contract24.svg';
import IBCSend24Icon from '~/images/icons/IBCSend24.svg';
import Reward24Icon from '~/images/icons/Reward24.svg';
import Send24Icon from '~/images/icons/Send24.svg';
import Transaction24Icon from '~/images/icons/Transaction24.svg';

type ActivityItemProps = {
  activity: ActivityData;
  chain: CosmosChain;
  displayAmount: string;
  displayDenom: string;
};

export default function ActivityItem({ activity, chain, displayAmount, displayDenom }: ActivityItemProps) {
  const { t } = useTranslation();

  const { explorerURL } = chain;
  const { extensionStorage } = useExtensionStorage();
  const { language } = extensionStorage;

  const { txHash, timestamp, type } = activity;

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/transactions/${txHash}` : ''), [explorerURL, txHash]);

  const formattedTimestamp = useMemo(() => {
    const date = new Date(Number(timestamp));

    return date.toLocaleString(convertToLocales(language), {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [language, timestamp]);

  const shortenedToAddress = useMemo(() => shorterAddress(activity.toAddress || txHash, 11), [activity.toAddress, txHash]);

  const trasactionIcon = useMemo(() => {
    if (type === COSMOS_ACTIVITY_TYPE.SEND) {
      return <Send24Icon />;
    }
    if (type === COSMOS_ACTIVITY_TYPE.IBC_SEND) {
      return <IBCSend24Icon />;
    }
    if (type === COSMOS_ACTIVITY_TYPE.CONTRACT) {
      return <Contract24Icon />;
    }
    if (type === COSMOS_ACTIVITY_TYPE.REWARD) {
      return <Reward24Icon />;
    }
    if (type === COSMOS_ACTIVITY_TYPE.COMMISSION) {
      return <Commission24Icon />;
    }
    return <Transaction24Icon />;
  }, [type]);

  const title = useMemo(() => {
    if (type === COSMOS_ACTIVITY_TYPE.SEND) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.send');
    }
    if (type === COSMOS_ACTIVITY_TYPE.IBC_SEND) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.ibcSend');
    }
    if (type === COSMOS_ACTIVITY_TYPE.CONTRACT) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.contract');
    }
    if (type === COSMOS_ACTIVITY_TYPE.REWARD) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.reward');
    }
    if (type === COSMOS_ACTIVITY_TYPE.COMMISSION) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.commission');
    }
    return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.transaction');
  }, [t, type]);

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
            <LeftIconContainer data-is-contract={type === COSMOS_ACTIVITY_TYPE.CONTRACT}>{trasactionIcon}</LeftIconContainer>
            <LeftTextContainer>
              <LeftTextTitleContainer>
                <Typography variant="h5">{title}</Typography>
              </LeftTextTitleContainer>
              <LeftTextSubtitleContainer>
                {activity.toAddress && <Typography variant="h6">To : </Typography>}
                {activity.toAddress && <>&nbsp;</>}
                <Typography variant="h6">{shortenedToAddress}</Typography>
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
              </RightTextContainer>
            )}
          </RightContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
