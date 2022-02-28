import { Typography } from '@mui/material';

import {
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
  children?: string;
  description?: string;
};

export default function AccountItemButton({ children, description, isActive = false, ...remainder }: AccountItemButtonProps) {
  const address = description
    ? description.length > 35
      ? `${description.substring(0, 12)}...${description.substring(description.length - 12, description.length)}`
      : description
    : '';

  return (
    <StyledButton {...remainder} data-is-active={isActive ? 1 : 0}>
      <ContentContainer>
        <ContentLeftContainer>
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
