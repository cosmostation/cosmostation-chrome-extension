import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { ContentCenterTextContainer, ContentContainer, ContentLeftImageContainer, ContentRightImageContainer, StyledButton } from './styled';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

type ChainButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  imgSrc?: string;
  isActive?: boolean;
};

export default function ChainButton({ children, imgSrc, isActive = false, ...remainder }: ChainButtonProps) {
  return (
    <StyledButton {...remainder}>
      <ContentContainer>
        <ContentLeftImageContainer>
          <Image src={imgSrc} />
        </ContentLeftImageContainer>
        <ContentCenterTextContainer>
          <Typography variant="h6">{children}</Typography>
        </ContentCenterTextContainer>
        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
