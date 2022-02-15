import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';

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

import CheckIcon from '~/images/icons/Check.svg';

type AccountItemButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  isActive?: boolean;
  children?: string;
};

export default function AccountItemButton({ children, isActive = false, ...remainder }: AccountItemButtonProps) {
  const chainName = children ? `${children.substring(0, 1).toUpperCase()}${children.substring(1).toLowerCase()}` : '';

  return (
    <StyledButton {...remainder} data-is-active={isActive ? 1 : 0}>
      <ContentContainer>
        <ContentLeftContainer>
          <ContentLeftTextContainer>
            <ContentLeftTitleContainer>
              <Typography variant="h6">{chainName}</Typography>
            </ContentLeftTitleContainer>
            <ContentLeftDescriptionContainer>
              <Number typoOfIntegers="h4n" typoOfDecimals="h6n">
                3000.00
              </Number>
            </ContentLeftDescriptionContainer>
          </ContentLeftTextContainer>
        </ContentLeftContainer>
        <ContentRightContainer>
          <ContentRightImageContainer>{isActive && <CheckIcon />}</ContentRightImageContainer>
        </ContentRightContainer>
      </ContentContainer>
    </StyledButton>
  );
}
