import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, ContentContainer, Footer, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from '~/images/icons/Close24.svg';

type NoticeBottomSheetProps = React.ComponentProps<typeof StyledBottomSheet> & {
  onClickConfirm: (isConfirmed: boolean) => void;
};

export default function NoticeBottomSheet({ children, onClickConfirm, onClose, ...remainder }: NoticeBottomSheetProps) {
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
            <Typography variant="h4">{t('pages.Wallet.Swap.components.NoticeBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <ContentContainer>{children}</ContentContainer>
        <Footer>
          <Button
            type="button"
            onClick={() => {
              onClickConfirm(true);
              onClose?.({}, 'backdropClick');
            }}
          >
            {t('pages.Wallet.Swap.components.NoticeBottomSheet.index.confirm')}
          </Button>
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}
