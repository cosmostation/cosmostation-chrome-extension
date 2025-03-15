import { Typography } from '@mui/material';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, ValidatorImage } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

import defaultValidatorImage from '@/assets/images/chain/defaultChain.png';

type StakingOptionBottomSheetProps = React.ComponentProps<typeof StyledBottomSheet> & {
  validatorName: string;
  validatorImage?: string;
};

export default function StakingOptionBottomSheet({ validatorName, validatorImage, children, onClose, ...remainder }: StakingOptionBottomSheetProps) {
  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <ValidatorImage src={validatorImage} defaultImgSrc={defaultValidatorImage} />
            <Typography variant="h3_B">{validatorName}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>{children}</Body>
      </Container>
    </StyledBottomSheet>
  );
}
