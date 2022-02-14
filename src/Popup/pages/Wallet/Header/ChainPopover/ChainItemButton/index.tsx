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

import CheckIcon from '~/images/icons/Check.svg';
import CloseIcon from '~/images/icons/Close.svg';

type ChainItemButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  imgSrc?: string;
  isActive?: boolean;
  children?: string;
  onClickDelete?: () => void;
};

export default function ChainItemButton({ children, imgSrc, isActive = false, onClickDelete, ...remainder }: ChainItemButtonProps) {
  const chainName = children ? `${children.substring(0, 1).toUpperCase()}${children.substring(1).toLowerCase()}` : '';

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
            <Typography variant="h6">{chainName}</Typography>
          </ContentLeftTextContainer>
        </ContentLeftContainer>
        <ContentRightContainer>
          <ContentRightImageContainer>{isActive && <CheckIcon />}</ContentRightImageContainer>
        </ContentRightContainer>
        {onClickDelete && (
          <DeleteContainer
            onClick={(event) => {
              event.stopPropagation();
              onClickDelete();
            }}
          >
            <CloseIcon />
          </DeleteContainer>
        )}
      </ContentContainer>
    </StyledButton>
  );
}
