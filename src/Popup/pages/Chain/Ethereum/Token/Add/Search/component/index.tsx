import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { EthereumToken } from '~/types/chain';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, RightContainer, StyledButton } from './styled';

import Check24Icon from '~/images/icons/Check24.svg';

type TokenItemProps = {
  token: EthereumToken;
  isActive?: () => void;
  disabled?: boolean;
};

export default function TokenItem({ token, disabled, isActive }: TokenItemProps) {
  return (
    <StyledButton disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={token.imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{token.displayDenom}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>{isActive && <Check24Icon />}</RightContainer>
    </StyledButton>
  );
}
