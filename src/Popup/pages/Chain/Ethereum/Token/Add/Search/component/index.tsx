import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { EthereumToken } from '~/types/chain';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, StyledButton } from './styled';

type TokenItemProps = {
  token: EthereumToken;
  onClick?: () => void;
  disabled?: boolean;
};

export default function TokenItem({ token, disabled, onClick }: TokenItemProps) {
  return (
    <StyledButton onClick={onClick} disabled={disabled}>
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
    </StyledButton>
  );
}
