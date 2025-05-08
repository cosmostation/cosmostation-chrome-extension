import { Typography } from '@mui/material';

import type { ValidatorStatus } from '@/types/cosmos/validator';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledValidatorImage } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type StakingOptionBottomSheetProps = React.ComponentProps<typeof StyledBottomSheet> & {
  validatorName: string;
  validatorImage?: string;
  status?: ValidatorStatus;
};

export default function StakingOptionBottomSheet({ validatorName, validatorImage, children, status, onClose, ...remainder }: StakingOptionBottomSheetProps) {
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
            <StyledValidatorImage imageURL={validatorImage} status={status} />
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
