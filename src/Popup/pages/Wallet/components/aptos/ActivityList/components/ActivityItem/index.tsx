import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Tooltip from '~/Popup/components/common/Tooltip';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { convertToLocales } from '~/Popup/utils/common';
import { shorterAddress } from '~/Popup/utils/string';
import type { Activity } from '~/types/extensionStorage';

import { Container, LeftContainer, LeftIconContainer, LeftTextContainer, LeftTextSubtitleContainer, LeftTextTitleContainer, StyledButton } from './styled';

import Transaction24Icon from '~/images/icons/Transaction24.svg';

type ActivityItemProps = {
  activity: Activity;
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const { t } = useTranslation();

  const { currentAptosNetwork } = useCurrentAptosNetwork();

  const { extensionStorage } = useExtensionStorage();
  const { language } = extensionStorage;

  const { explorerURL, networkName } = currentAptosNetwork;
  const { txHash, timestamp } = activity;

  const txDetailExplorerURL = useMemo(
    () => (explorerURL ? `${explorerURL}/txn/${txHash}?network=${networkName.toLowerCase()}` : ''),
    [explorerURL, networkName, txHash],
  );

  const formattedTimestamp = useMemo(() => {
    const date = new Date(Number(timestamp));

    return date.toLocaleString(convertToLocales(language), {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }, [language, timestamp]);

  const shorterToAddress = useMemo(() => shorterAddress(activity.toAddress || txHash, 11), [activity.toAddress, txHash]);

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
            <LeftIconContainer>
              <Transaction24Icon />
            </LeftIconContainer>
            <LeftTextContainer>
              <LeftTextTitleContainer>
                <Typography variant="h5">{t('pages.Wallet.components.aptos.ActivityList.components.ActivityItem.index.transaction')}</Typography>
              </LeftTextTitleContainer>
              <LeftTextSubtitleContainer>
                <Typography variant="h6">{shorterToAddress}</Typography>
              </LeftTextSubtitleContainer>
              <LeftTextSubtitleContainer>
                <Typography variant="h6">{formattedTimestamp}</Typography>
              </LeftTextSubtitleContainer>
            </LeftTextContainer>
          </LeftContainer>
        </Container>
      </Tooltip>
    </StyledButton>
  );
}
