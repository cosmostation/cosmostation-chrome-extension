import { Typography } from '@mui/material';

import ethereumImage from '~/images/symbols/ethereum.png';

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
          <img
            src={imgSrc ?? 'https://'}
            alt=""
            onError={(event) => {
              // eslint-disable-next-line no-param-reassign
              event.currentTarget.onerror = null;
              // eslint-disable-next-line no-param-reassign
              event.currentTarget.src = ethereumImage;
            }}
          />
        </ContentLeftImageContainer>
        <ContentCenterTextContainer>
          <Typography variant="h6">{children}</Typography>
        </ContentCenterTextContainer>
        <ContentRightImageContainer>{isActive ? <UpArrow /> : <BottomArrow />}</ContentRightImageContainer>
      </ContentContainer>
    </StyledButton>
  );
}
