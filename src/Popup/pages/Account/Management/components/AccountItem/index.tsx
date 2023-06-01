import { Typography } from '@mui/material';

import type { AccountType } from '~/types/extensionStorage';

import { Container, LeftContainer, LeftLedgerContainer, LeftTextContainer, RightContainer, StyledButton } from './styled';

import Add24Icon from '~/images/icons/Add24.svg';
import Ledger14Icon from '~/images/icons/Ledger14.svg';

type AccountItemProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  children?: string;
  isActive?: boolean;
  accountType?: AccountType;
};

export default function AccountItem({ children, isActive, accountType, ...remainder }: AccountItemProps) {
  return (
    <Container>
      <LeftContainer>
        <LeftTextContainer>
          <Typography variant="h5">{children}</Typography>
        </LeftTextContainer>
        {accountType === 'LEDGER' && (
          <LeftLedgerContainer>
            <Ledger14Icon />
          </LeftLedgerContainer>
        )}
      </LeftContainer>
      <RightContainer>
        <StyledButton data-is-active={isActive ? 1 : 0} {...remainder}>
          <Add24Icon />
        </StyledButton>
      </RightContainer>
    </Container>
  );
}
