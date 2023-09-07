import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { IN_APP_APTOS_TRANSACTION_TYPE, IN_APP_SUI_TRANSACTION_TYPE } from '~/constants/extensionStorage';
import NumberText from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { shorterAddress } from '~/Popup/utils/string';
import type { Activity } from '~/types/extensionStorage';

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

import IBCSend24Icon from '~/images/icons/IBCSend24.svg';
import Send24Icon from '~/images/icons/Send24.svg';

type ActivityItemProps = {
  activity: Activity;
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const { t } = useTranslation();

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { explorerURL, networkName } = currentAptosNetwork;
  const { txHash, timestamp, type } = activity;

  const txDetailExplorerURL = useMemo(
    () => (explorerURL ? `${explorerURL}/txn/${txHash}?network=${networkName.toLowerCase()}` : ''),
    [explorerURL, networkName, txHash],
  );

  const formattedTimestamp = useMemo(() => {
    const date = new Date(Number(timestamp));

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [timestamp]);

  const sampleToAddress = 'stars1aygdt8742gamxv8ca99wzh56ry4xw5s33vvxu2';

  const shorterToAddress = useMemo(() => shorterAddress(sampleToAddress, 11), []);

  // NOTE 필요한 아이콘(24픽셀) 1. 트랜잭션 디폴트 아이콘(우상향 하는 아이콘이었으면 함) 2. 컨트랙트 실행 아이콘
  const trasactionIcon = useMemo(() => {
    if (type === IN_APP_APTOS_TRANSACTION_TYPE.TRANSACTION) {
      return <Send24Icon />;
    }
    return <IBCSend24Icon />;
  }, [type]);

  const title = useMemo(() => {
    if (type === IN_APP_SUI_TRANSACTION_TYPE.TRANSACTION) {
      return t('pages.Wallet.components.aptos.ActivityList.components.ActivityItem.index.transaction');
    }

    return t('pages.Wallet.components.aptos.ActivityList.components.ActivityItem.index.transaction');
  }, [t, type]);

  const transactionAmount = useMemo(() => '1', []);

  return (
    <StyledButton onClick={() => window.open(txDetailExplorerURL)} disabled={!txDetailExplorerURL}>
      <Tooltip
        title={!txDetailExplorerURL ? t('pages.Wallet.components.aptos.ActivityList.components.ActivityItem.index.noExplorerURL') : ''}
        varient="error"
        placement="top"
        arrow
      >
        <Container>
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
                <Typography variant="h6">Default</Typography>
              </RightTextContainer>
            ) : (
              <RightTextContainer>
                <Typography variant="h6">-</Typography>
              </RightTextContainer>
            )}
          </RightContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
