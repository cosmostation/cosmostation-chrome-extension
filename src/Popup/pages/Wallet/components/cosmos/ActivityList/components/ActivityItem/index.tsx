import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { convertToLocales } from '~/Popup/utils/common';
import { getMsgType } from '~/Popup/utils/cosmos';
import { shorterAddress } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';
import type { Activity } from '~/types/cosmos/activity';

import {
  Container,
  LeftContainer,
  LeftIconContainer,
  LeftTextContainer,
  LeftTextSubtitleContainer,
  LeftTextTitleContainer,
  RightContainer,
  // RightTextContainer,
  StyledButton,
} from './styled';

// import Commission24Icon from '~/images/icons/Commission24.svg';
// import Contract24Icon from '~/images/icons/Contract24.svg';
// import IBCSend24Icon from '~/images/icons/IBCSend24.svg';
// import Reward24Icon from '~/images/icons/Reward24.svg';
// import Send24Icon from '~/images/icons/Send24.svg';
import Transaction24Icon from '~/images/icons/Transaction24.svg';

type ActivityItemProps = {
  activity: Activity;
  chain: CosmosChain;
};

export default function ActivityItem({ activity, chain }: ActivityItemProps) {
  const { t } = useTranslation();

  const { explorerURL } = chain;
  const { extensionStorage } = useExtensionStorage();
  const { language } = extensionStorage;

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

  // const aa = getDpCoin(activity, chain);

  // const shortenedToAddress = useMemo(() => shorterAddress(activity.toAddress || txHash, 11), [activity.toAddress, txHash]);
  const shortenedToAddress = useMemo(() => shorterAddress('fsdf', 11), []);

  // const trasactionIcon = useMemo(() => {
  //   if (type === COSMOS_ACTIVITY_TYPE.SEND) {
  //     return <Send24Icon />;
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.IBC_SEND) {
  //     return <IBCSend24Icon />;
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.CONTRACT) {
  //     return <Contract24Icon />;
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.REWARD) {
  //     return <Reward24Icon />;
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.COMMISSION) {
  //     return <Commission24Icon />;
  //   }
  //   return <Transaction24Icon />;
  // }, [type]);
  const trasactionIcon = useMemo(() => <Transaction24Icon />, []);

  // const title = useMemo(() => {
  //   if (type === COSMOS_ACTIVITY_TYPE.SEND) {
  //     return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.send');
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.IBC_SEND) {
  //     return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.ibcSend');
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.CONTRACT) {
  //     return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.contract');
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.REWARD) {
  //     return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.reward');
  //   }
  //   if (type === COSMOS_ACTIVITY_TYPE.COMMISSION) {
  //     return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.commission');
  //   }
  //   return t('pages.Wallet.components.cosmos.ActivityList.components.ActivityItem.index.transaction');
  // }, [t, type]);

  const title = useMemo(() => getMsgType(activity, address), [activity, address]);

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
            <LeftIconContainer data-is-contract>{trasactionIcon}</LeftIconContainer>
            <LeftTextContainer>
              <LeftTextTitleContainer>
                <Typography variant="h5">{title}</Typography>
              </LeftTextTitleContainer>
              <LeftTextSubtitleContainer>
                {/* {activity.toAddress && <Typography variant="h6">To : </Typography>}
                {activity.toAddress && <>&nbsp;</>} */}
                <Typography variant="h6">{shortenedToAddress}</Typography>
              </LeftTextSubtitleContainer>
              <LeftTextSubtitleContainer>
                <Typography variant="h6">{formattedTimestamp}</Typography>
              </LeftTextSubtitleContainer>
            </LeftTextContainer>
          </LeftContainer>
          <RightContainer>
            {/* {gt(displayAmount, '0') && displayDenom && (
              <RightTextContainer>
                <NumberText typoOfIntegers="h5n" typoOfDecimals="h7n">
                  {displayAmount}
                </NumberText>
                <Typography variant="h6">{displayDenom}</Typography>
              </RightTextContainer>
            )} */}
          </RightContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
