import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import { useCurrentTab } from '~/Popup/hooks/SWR/cache/useCurrentTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, DescriptionContainer, OriginContainer, StyledButton } from './styled';

type ConnectDialogProps = Omit<DialogProps, 'children'>;
export default function ConnectDialog({ onClose, ...remainder }: ConnectDialogProps) {
  const { data } = useCurrentTab(true);
  const { t } = useTranslation();

  const { currentAccount, addAllowedOrigin, removeAllowedOrigin } = useCurrentAccount();

  const { allowedOrigins } = currentAccount;

  const origin = data?.origin || '';

  if (!origin) {
    return null;
  }

  const isConnected = allowedOrigins.includes(origin);

  const actionName = isConnected
    ? t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.disconnect')
    : t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.connect');

  const handleOnClick = async () => {
    if (isConnected) {
      await removeAllowedOrigin(origin);
    } else {
      await addAllowedOrigin(origin);
    }

    onClose?.({}, 'backdropClick');
  };

  return (
    <Dialog {...remainder} onClose={onClose}>
      <DialogHeader onClose={onClose}>{actionName}</DialogHeader>
      <Container>
        <OriginContainer>
          <Typography variant="h5">{origin}</Typography>
        </OriginContainer>
        <DescriptionContainer>
          {isConnected ? (
            <Typography variant="h5">
              {t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.disconnectDescription1')}
              <br />
              {t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.disconnectDescription2')}
            </Typography>
          ) : (
            <Typography variant="h5">
              {t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.connectDescription1')}
              <br />
              {t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.connectDescription2')}
            </Typography>
          )}
        </DescriptionContainer>
        <StyledButton onClick={handleOnClick}>{actionName}</StyledButton>
      </Container>
    </Dialog>
  );
}
