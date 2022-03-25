import { Typography } from '@mui/material';

import { shorterAddress } from '~/Popup/utils/common';

import {
  ConnectBadge,
  ConnectBadgeContainer,
  ConnectContainer,
  ContentContainer,
  ContentLeftContainer,
  ContentLeftDescriptionContainer,
  ContentLeftTextContainer,
  ContentLeftTitleContainer,
  ContentRightContainer,
  ContentRightImageContainer,
  StyledButton,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type AccountItemButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  isActive?: boolean;
  isConnected?: boolean;
  children?: string;
  description?: string;
};

export default function AccountItemButton({ children, description, isActive = false, isConnected, ...remainder }: AccountItemButtonProps) {
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
              <Typography variant="h6">{children}</Typography>
            </ContentLeftTitleContainer>
            <ContentLeftDescriptionContainer>
              <Typography variant="h7">{address}</Typography>
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
