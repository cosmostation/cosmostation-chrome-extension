import { Typography } from '@mui/material';

import {
  AccountLeftContainer,
  AccountRightContainer,
  AccountRightFirstContainer,
  AccountRightSecendContainer,
  AccountRightSecendTextContainer,
  Badge,
  StyledButton,
} from './styled';

import Account from '~/images/icons/Account.svg';

type AccountButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isConnected?: boolean;
};

export default function AccountButton({ isConnected = false, children, ...remainder }: AccountButtonProps) {
  return (
    <StyledButton {...remainder}>
      <AccountLeftContainer>
        <Account />
      </AccountLeftContainer>
      <AccountRightContainer>
        <AccountRightFirstContainer>
          <Typography variant="h6">{children}</Typography>
        </AccountRightFirstContainer>
        <AccountRightSecendContainer>
          <Badge data-is-connected={isConnected ? 1 : 0} />
          <AccountRightSecendTextContainer>
            <Typography variant="h7">{isConnected ? 'connected' : 'disconnected'}</Typography>
          </AccountRightSecendTextContainer>
        </AccountRightSecendContainer>
      </AccountRightContainer>
    </StyledButton>
  );
}
