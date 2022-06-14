import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import {
  ContentContainer,
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
  children?: string;
  onClickDelete?: () => void;
};

export default function NetworkItemButton({ children, imgSrc, isActive = false, onClickDelete, ...remainder }: ChainItemButtonProps) {
  return (
    <StyledButton {...remainder} data-is-active={isActive ? 1 : 0}>
      <ContentContainer>
        <ContentLeftContainer>
          {imgSrc && (
            <ContentLeftImageContainer>
              <Image src={imgSrc} />
            </ContentLeftImageContainer>
          )}
          <ContentLeftTextContainer>
            <Typography variant="h6">{children}</Typography>
          </ContentLeftTextContainer>
        </ContentLeftContainer>
        <ContentRightContainer>
          <ContentRightImageContainer>{isActive && <Check16Icon />}</ContentRightImageContainer>
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
