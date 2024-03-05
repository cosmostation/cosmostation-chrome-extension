import { Typography } from '@mui/material';

import { useTranslation } from '~/Popup/hooks/useTranslation';

import { WarningContainer, WarningContentsContainer, WarningTextContainer } from './styled';

import IBCWarningIcon from '~/images/icons/IBCWarning.svg';

export default function IBCError() {
  const { t } = useTranslation();

  return (
    <WarningContainer>
      <WarningContentsContainer>
        <IBCWarningIcon />
        <WarningTextContainer>
          <Typography variant="h4">{t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.ibcWarningHeadertitle')}</Typography>
          <Typography variant="h6">{t('pages.Wallet.Send.Entry.Cosmos.components.IBCSend.index.ibcWarningSubtitle')}</Typography>
        </WarningTextContainer>
      </WarningContentsContainer>
    </WarningContainer>
  );
}
