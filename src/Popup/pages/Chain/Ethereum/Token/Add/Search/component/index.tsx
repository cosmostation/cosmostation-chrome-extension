import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import type { EthereumToken } from '~/types/chain';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, StyledButton } from './styled';

type TokenItemProps = {
  token: EthereumToken;
  imageProps?: React.ComponentProps<typeof Image>;
  children?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function TokenItem({ imageProps, children, disabled, onClick }: TokenItemProps) {
  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image {...imageProps} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{children}</Typography>
          </LeftTextChainContainer>
        </LeftTextContainer>
      </LeftContainer>
    </StyledButton>
  );
}
