import { Typography } from '@mui/material';

import unknownImg from '~/images/chainImgs/unknown.png';
import customBeltImg from '~/images/etc/customBelt.png';
import Image from '~/Popup/components/common/Image';

import {
  ContentCenterTextContainer,
  ContentContainer,
  ContentLeftAbsoluteImageContainer,
  ContentLeftImageContainer,
  ContentRightImageContainer,
  StyledButton,
} from './styled';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

type ChainButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  imgSrc?: string;
  isActive?: boolean;
  isCustom?: boolean;
  children?: string;
};

export default function ChainButton({ children, imgSrc, type = 'button', isCustom = false, isActive = false, ...remainder }: ChainButtonProps) {
  return (
    <StyledButton {...remainder} type={type}>
      <ContentContainer>
        <ContentLeftImageContainer>
          <ContentLeftAbsoluteImageContainer data-is-custom={isCustom && !!imgSrc}>
            <Image src={imgSrc} defaultImgSrc={unknownImg} />
          </ContentLeftAbsoluteImageContainer>
          {isCustom && (
            <ContentLeftAbsoluteImageContainer data-is-custom={isCustom && !!imgSrc}>
              <Image src={customBeltImg} />
            </ContentLeftAbsoluteImageContainer>
          )}
        </ContentLeftImageContainer>
        <ContentCenterTextContainer>
          <Typography variant="h6">{children}</Typography>
        </ContentCenterTextContainer>
        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
