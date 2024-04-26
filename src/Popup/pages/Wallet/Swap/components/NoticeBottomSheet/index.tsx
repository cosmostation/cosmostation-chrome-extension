import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { Container, ContentContainer, Footer, Header, HeaderTitle, StyledBottomSheet } from './styled';

import Caution24Icon from '~/images/icons/Caution24.svg';

type NoticeBottomSheetProps = React.ComponentProps<typeof StyledBottomSheet> & {
  onClickConfirm: (isConfirmed: boolean) => void;
};

export default function NoticeBottomSheet({ children, onClickConfirm, onClose, ...remainder }: NoticeBottomSheetProps) {
  const { t } = useTranslation();

  return (
    <StyledBottomSheet {...remainder}>
      <Container>
        <Header>
          <HeaderTitle>
            <Caution24Icon />
            <Typography variant="h3">{t('pages.Wallet.Swap.components.NoticeBottomSheet.index.title')}</Typography>
          </HeaderTitle>
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
