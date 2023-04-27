import { Typography } from '@mui/material';

import { shorterAddress } from '~/Popup/utils/string';
import type { AccountType } from '~/types/extensionStorage';

import {
  ConnectBadge,
  ConnectBadgeContainer,
  ConnectContainer,
  ContentContainer,
  ContentLeftContainer,
  ContentLeftDescriptionContainer,
  ContentLeftTextContainer,
  ContentLeftTitleContainer,
  ContentLeftTitleLedgerContainer,
  ContentLeftTitleTextContainer,
  ContentRightContainer,
  ContentRightImageContainer,
  StyledButton,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';
import Ledger14Icon from '~/images/icons/Ledger14.svg';

type AccountItemButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  isActive?: boolean;
  isConnected?: boolean;
  children?: string;
  description?: string;
  accountType?: AccountType;
};

export default function AccountItemButton({ children, description, isActive = false, isConnected, accountType, ...remainder }: AccountItemButtonProps) {
  const address = shorterAddress(description, 30);

  return (
    <StyledButton {...remainder} data-is-active={isActive ? 1 : 0}>
      <ContentContainer>
        <ContentLeftContainer>
          {isConnected !== undefined && (
            <ConnectContainer>
              <ConnectBadgeContainer>
                <ConnectBadge data-is-connected={isConnected ? 1 : 0} />
              </ConnectBadgeContainer>
              <ConnectBadgeContainer>
                <div style={{ height: '0.6rem' }} />
              </ConnectBadgeContainer>
            </ConnectContainer>
          )}
          <ContentLeftTextContainer>
            <ContentLeftTitleContainer>
              <ContentLeftTitleTextContainer>
                <Typography variant="h6">{children}</Typography>
              </ContentLeftTitleTextContainer>
              {accountType === 'LEDGER' && (
                <ContentLeftTitleLedgerContainer>
                  <Ledger14Icon />
                </ContentLeftTitleLedgerContainer>
              )}
            </ContentLeftTitleContainer>
            <ContentLeftDescriptionContainer>
              <Typography variant="h7">{address}&nbsp;</Typography>
            </ContentLeftDescriptionContainer>
          </ContentLeftTextContainer>
        </ContentLeftContainer>
        <ContentRightContainer>
          <ContentRightImageContainer>{isActive && <Check16Icon />}</ContentRightImageContainer>
        </ContentRightContainer>
      </ContentContainer>
    </StyledButton>
  );
}
