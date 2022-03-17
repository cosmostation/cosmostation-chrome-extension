import { Suspense } from 'react';
import { Typography } from '@mui/material';

import { useCurrentTab } from '~/Popup/hooks/SWR/cache/useCurrentTab';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';

import {
  AccountLeftContainer,
  AccountRightContainer,
  AccountRightFirstContainer,
  ConnectButton,
  ConnectButtonBadge,
  ConnectButtonText,
  Container,
  StyledButton,
} from './styled';

import Account from '~/images/icons/Account.svg';

type AccountButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isConnected?: boolean;
};

export default function AccountButton({ children, ...remainder }: AccountButtonProps) {
  return (
    <Container>
      <StyledButton {...remainder}>
        <AccountLeftContainer>
          <Account />
        </AccountLeftContainer>
        <AccountRightContainer>
          <AccountRightFirstContainer>
            <Typography variant="h6">{children}</Typography>
          </AccountRightFirstContainer>
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

  const { currentAccount } = useCurrentAccount();

  const { allowedOrigins } = currentAccount;

  const origin = data?.origin || '';

  if (!origin) {
    return null;
  }

  const isConnected = allowedOrigins.includes(origin);

  return (
    <ConnectButton>
      <ConnectButtonBadge data-is-connected={isConnected ? 1 : 0} />
      <ConnectButtonText>
        <Typography variant="h7">{isConnected ? '연결 됨' : '연결 안 됨'}</Typography>
      </ConnectButtonText>
    </ConnectButton>
  );
}
