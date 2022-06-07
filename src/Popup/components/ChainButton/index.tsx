import { Typography } from '@mui/material';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import Image from '~/Popup/components/common/Image';

import { ContentCenterTextContainer, ContentContainer, ContentLeftImageContainer, ContentRightImageContainer, StyledButton } from './styled';

import BottomArrow from '~/images/icons/BottomArrow.svg';
import UpArrow from '~/images/icons/UpArrow.svg';

type ChainButtonProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  imgSrc?: string;
  isActive?: boolean;
  children?: string;
};

export default function ChainButton({ children, imgSrc, type = 'button', isActive = false, ...remainder }: ChainButtonProps) {
  const isWithNetwork = children === ETHEREUM.chainName;

  return (
    <StyledButton {...remainder} type={type}>
      <ContentContainer>
        <ContentLeftImageContainer>
          <Image src={imgSrc} />
        </ContentLeftImageContainer>
        <ContentCenterTextContainer data-is-with-network={isWithNetwork ? 1 : 0}>
          <Typography variant="h6">{children}</Typography>
        </ContentCenterTextContainer>
        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
