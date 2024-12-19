import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type StakingOptionBottomSheetProps = React.ComponentProps<typeof StyledBottomSheet>;

export default function StakingOptionBottomSheet({ children, onClose, ...remainder }: StakingOptionBottomSheetProps) {
  const { t } = useTranslation();

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
            <Typography variant="h2_B">{t('pages.coin-detail.$coinId.manage-stake.Entry.components.StakingOptionBottomSheet.index.title')}</Typography>
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
