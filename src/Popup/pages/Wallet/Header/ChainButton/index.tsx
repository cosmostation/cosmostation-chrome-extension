import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { ContentCenterTextContainer, ContentContainer, ContentLeftImageContainer, ContentRightImageContainer, StyledButton } from './styled';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

type ChainButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  imgSrc?: string;
  isActive?: boolean;
  children?: string;
};

export default function ChainButton({ children, imgSrc, isActive = false, ...remainder }: ChainButtonProps) {
  const chainName = children ? `${children.substring(0, 1).toUpperCase()}${children.substring(1).toLowerCase()}` : '';

  return (
    <StyledButton {...remainder}>
      <ContentContainer>
        <ContentLeftImageContainer>
          <Image src={imgSrc} />
        </ContentLeftImageContainer>
        <ContentCenterTextContainer>
          <Typography variant="h6">{chainName}</Typography>
        </ContentCenterTextContainer>
        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
