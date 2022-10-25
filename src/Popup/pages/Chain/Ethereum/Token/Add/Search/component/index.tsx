import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, RightContainer, StyledButton } from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type TokenItemProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  symbol: string;
  name: string;
  isActive?: boolean;
  disabled?: boolean;
  imageProps?: React.ComponentProps<typeof Image>;
};

export default function TokenItem({ symbol, name, disabled, isActive = false, imageProps, ...remainder }: TokenItemProps) {
  return (
    <StyledButton {...remainder} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image {...imageProps} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5"> {symbol} </Typography>
            <Typography variant="h6" color="#727E91">
              {name}
            </Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </StyledButton>
  );
}
