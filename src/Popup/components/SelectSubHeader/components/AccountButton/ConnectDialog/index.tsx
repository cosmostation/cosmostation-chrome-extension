import type { DialogProps } from '@mui/material';
import { Typography } from '@mui/material';

import Dialog from '~/Popup/components/common/Dialog';
import DialogHeader from '~/Popup/components/common/Dialog/Header';
import Image from '~/Popup/components/common/Image';
import { useCurrentTab } from '~/Popup/hooks/SWR/cache/useCurrentTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getSiteIconURL } from '~/Popup/utils/common';

import { Container, DescriptionContainer, OriginContainer, OriginImageContainer, OriginTextContainer, StyledButton } from './styled';

type ConnectDialogProps = Omit<DialogProps, 'children'>;
export default function ConnectDialog({ onClose, ...remainder }: ConnectDialogProps) {
  const { data } = useCurrentTab(true);
  const { t } = useTranslation();

  const { addAllowedOrigin, removeAllowedOrigin, currentAccountAllowedOrigins, removeSuiPermissions, addSuiPermissions } = useCurrentAccount();

  const origin = data?.origin || '';

  if (!origin) {
    return null;
  }

  const isConnected = currentAccountAllowedOrigins.includes(origin);

  const actionName = isConnected
    ? t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.disconnect')
    : t('pages.Wallet.components.Header.AccountButton.ConnectDialog.index.connect');

  const handleOnClick = async () => {
    if (isConnected) {
      await removeAllowedOrigin(origin);

      await removeSuiPermissions(['viewAccount', 'suggestTransactions'], origin);
    } else {
      await addAllowedOrigin(origin);

      await addSuiPermissions(['viewAccount', 'suggestTransactions'], origin);
    }

    onClose?.({}, 'backdropClick');
  };

  const faviconURL = (() => {
    try {
      return getSiteIconURL(new URL(origin).host);
    } catch {
      return undefined;
    }
  })();

  return (
    <Dialog {...remainder} onClose={onClose}>
      <DialogHeader onClose={onClose}>{actionName}</DialogHeader>
      <Container>
        <OriginContainer>
          {faviconURL && (
            <OriginImageContainer>
              <Image src={faviconURL} />
            </OriginImageContainer>
          )}
          <OriginTextContainer>
            <Typography variant="h5">{origin}</Typography>
          </OriginTextContainer>
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
