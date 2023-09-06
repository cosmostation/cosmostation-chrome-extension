import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { IN_APP_COSMOS_TRANSACTION_TYPE } from '~/constants/extensionStorage';
import NumberText from '~/Popup/components/common/Number';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Activity } from '~/types/extensionStorage';

import {
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

type ActivityItemProps = {
  activity: Activity;
  chain: CosmosChain;
};

export default function ActivityItem({ activity, chain }: ActivityItemProps) {
  const { t } = useTranslation();

  const { explorerURL } = chain;
  const { txHash, timestamp, type } = activity;

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/transactions/${txHash}` : ''), [explorerURL, txHash]);

  const formattedTimestamp = useMemo(() => {
    const date = new Date(Number(timestamp));

    return date.toLocaleString('en-US');
  }, [timestamp]);

  const sampleToAddress = 'stars1aygdt8742gamxv8ca99wzh56ry4xw5s33vvxu2';

  const shorterToAddress = useMemo(() => shorterAddress(sampleToAddress, 11), []);

  // NOTE 필요한 아이콘(24픽셀) 1. 트랜잭션 디폴트 아이콘(우상향 하는 아이콘이었으면 함) 2. 컨트랙트 실행 아이콘
  const trasactionIcon = useMemo(() => {
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.SEND) {
      return <Send24Icon />;
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.IBC_SEND) {
      return <IBCSend24Icon />;
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.CONTRACT) {
      return <Contract24Icon />;
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.REWARD) {
      return <Reward24Icon />;
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.COMMISSION) {
      return <Commission24Icon />;
    }
    // 디폴트 아이콘이 들어가야함
    return <IBCSend24Icon />;
  }, [type]);

  const title = useMemo(() => {
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.SEND) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.send');
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.IBC_SEND) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.ibcSend');
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.CONTRACT) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.contract');
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.REWARD) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.reward');
    }
    if (type === IN_APP_COSMOS_TRANSACTION_TYPE.COMMISSION) {
      return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.commission');
    }
    return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.transaction');
  }, [t, type]);

  const transactionAmount = useMemo(() => '1', []);

  return (
    <StyledButton onClick={() => window.open(txDetailExplorerURL)}>
      <LeftContainer>
        <LeftIconContainer>{trasactionIcon}</LeftIconContainer>
        <LeftTextContainer>
          <LeftTextTitleContainer>
            <Typography variant="h5">{title}</Typography>
          </LeftTextTitleContainer>
          <>
            <LeftTextSubtitleContainer>
              <Typography variant="h6">{shorterToAddress}</Typography>
            </LeftTextSubtitleContainer>
            <LeftTextSubtitleContainer>
              <Typography variant="h6">{formattedTimestamp}</Typography>
            </LeftTextSubtitleContainer>
          </>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        {transactionAmount ? (
          <RightTextContainer>
            <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
              {transactionAmount}
            </NumberText>
            <Typography variant="h6">{chain.displayDenom}</Typography>
          </RightTextContainer>
        ) : (
          <RightTextContainer>
            <Typography variant="h6">-</Typography>
          </RightTextContainer>
        )}
      </RightContainer>
    </StyledButton>
  );
}
