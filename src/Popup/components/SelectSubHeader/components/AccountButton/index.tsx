import { Suspense, useState } from 'react';
import stc from 'string-to-color';
import { Typography } from '@mui/material';

import { useCurrentTab } from '~/Popup/hooks/SWR/cache/useCurrentTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AccountWithName } from '~/types/extensionStorage';

import ConnectDialog from './ConnectDialog';
import {
  AccountLeftContainer,
  AccountRightContainer,
  AccountRightFirstContainer,
  AccountRightLedgerContainer,
  ConnectButton,
  ConnectButtonBadge,
  ConnectButtonText,
  Container,
  StyledButton,
} from './styled';

import AccountIcon from '~/images/icons/Account.svg';
import Ledger14Icon from '~/images/icons/Ledger14.svg';

type AccountButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isConnected?: boolean;
  account: AccountWithName;
};

export default function AccountButton({ account, ...remainder }: AccountButtonProps) {
  const { id, name } = account;

  const accountColor = stc(id);
  return (
    <Container>
      <StyledButton {...remainder} data-account-color={accountColor}>
        <AccountLeftContainer data-account-color={accountColor}>
          <AccountIcon />
        </AccountLeftContainer>
        <AccountRightContainer>
          <AccountRightFirstContainer>
            <Typography variant="h6">{name}</Typography>
          </AccountRightFirstContainer>
          {account.type === 'LEDGER' && (
            <AccountRightLedgerContainer>
              <Ledger14Icon />
            </AccountRightLedgerContainer>
          )}
        </AccountRightContainer>
      </StyledButton>
      <Suspense fallback={null}>
        <ConnectionButton />
      </Suspense>
    </Container>
  );
}

function ConnectionButton() {
  const { data } = useCurrentTab(true);

  const { t } = useTranslation();

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const { currentAccountAllowedOrigins } = useCurrentAccount();

  const origin = data?.origin || '';

  if (!origin) {
    return null;
  }

  const isConnected = currentAccountAllowedOrigins.includes(origin);

  return (
    <>
      <ConnectButton onClick={() => setIsOpenDialog(true)}>
        <ConnectButtonBadge data-is-connected={isConnected ? 1 : 0} />
        <ConnectButtonText>
          <Typography variant="h7">
            {isConnected
              ? t('pages.Wallet.components.Header.AccountButton.index.connected')
              : t('pages.Wallet.components.Header.AccountButton.index.notConnected')}
          </Typography>
        </ConnectButtonText>
      </ConnectButton>
      <ConnectDialog open={isOpenDialog} onClose={() => setIsOpenDialog(false)} />
    </>
  );
}
