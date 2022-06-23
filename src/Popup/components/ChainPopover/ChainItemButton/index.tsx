import { Typography } from '@mui/material';

import customBeltImg from '~/images/etc/customBelt.png';
import Image from '~/Popup/components/common/Image';

import {
  BackgroundActive,
  ContentContainer,
  ContentLeftAbsoluteImageContainer,
  ContentLeftContainer,
  ContentLeftImageContainer,
  ContentLeftTextContainer,
  ContentRightContainer,
  ContentRightImageContainer,
  DeleteContainer,
  StyledButton,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';
import Close16Icon from '~/images/icons/Close16.svg';

type ChainItemButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  imgSrc?: string;
  isActive?: boolean;
  isBackgroundActive?: boolean;
  isCustom?: boolean;
  children?: string;
  onClickDelete?: () => void;
};

export default function ChainItemButton({
  children,
  imgSrc,
  isActive = false,
  isBackgroundActive = false,
  isCustom = false,
  onClickDelete,
  ...remainder
}: ChainItemButtonProps) {
  const isBackActive = !isActive && isBackgroundActive;
  return (
    <StyledButton {...remainder} data-is-active={isActive || isBackActive ? 1 : 0}>
      <ContentContainer>
        <ContentLeftContainer>
          <ContentLeftImageContainer>
            <ContentLeftAbsoluteImageContainer>
              <Image src={imgSrc} />
            </ContentLeftAbsoluteImageContainer>
            {isCustom && (
              <ContentLeftAbsoluteImageContainer>
                <Image src={customBeltImg} />
              </ContentLeftAbsoluteImageContainer>
            )}
          </ContentLeftImageContainer>
          <ContentLeftTextContainer>
            <Typography variant="h6">{children}</Typography>
          </ContentLeftTextContainer>
        </ContentLeftContainer>
        <ContentRightContainer>
          <ContentRightImageContainer data-is-background-active={isBackActive ? 1 : 0}>
            {isActive && <Check16Icon />}
            {isBackActive && <BackgroundActive />}
          </ContentRightImageContainer>
        </ContentRightContainer>
        {onClickDelete && (
          <DeleteContainer
            onClick={(event) => {
              event.stopPropagation();
              onClickDelete();
            }}
          >
            <Close16Icon />
          </DeleteContainer>
        )}
      </ContentContainer>
    </StyledButton>
  );
}
