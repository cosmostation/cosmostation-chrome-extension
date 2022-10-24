import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';

import { LeftContainer, LeftImageContainer, LeftTextChainContainer, LeftTextContainer, StyledButton } from './styled';

type TokenItemProps = {
  imageProps?: React.ComponentProps<typeof Image>;
  children?: string;
  onClick?: () => void;
  disabled?: boolean;
};

// 토큰 name, 이미지,

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
