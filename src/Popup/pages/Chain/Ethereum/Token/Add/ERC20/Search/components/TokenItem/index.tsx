import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, RightContainer, StyledButton } from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type TokenItemProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  isActive?: boolean;
  disabled?: boolean;
  name: string;
  symbol: string;
  imageURL?: string;
};

export default function TokenItem({ disabled, isActive = false, name, symbol, imageURL }: TokenItemProps) {
  return (
    <StyledButton disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
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
