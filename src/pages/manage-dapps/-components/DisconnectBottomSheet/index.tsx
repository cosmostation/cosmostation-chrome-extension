import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';

import { Body, Container, Footer, Header, HeaderTitle, StyledBottomSheet, TextContaienr } from './styled';

type DisconnectBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickConfirm: () => void;
  onClickCancel?: () => void;
};

export default function DisconnectBottomSheet({ onClickCancel, onClickConfirm, onClose, ...remainder }: DisconnectBottomSheetProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onClickConfirm();
    onClose?.({}, 'backdropClick');
  };

  const handleCancel = () => {
    onClickCancel?.();
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet {...remainder}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{t('pages.manage-dapps.components.DisconnectBottomSheet.index.title')}</Typography>
          </HeaderTitle>
        </Header>
        <Body>
          <TextContaienr>
            <Base1000Text variant="b3_R_Multiline">{t('pages.manage-dapps.components.DisconnectBottomSheet.index.description')}</Base1000Text>
          </TextContaienr>
        </Body>
        <Footer>
          <SplitButtonsLayout
            cancelButton={
              <Button onClick={handleCancel} variant="dark">
                {t('pages.manage-dapps.components.DisconnectBottomSheet.index.cancel')}
              </Button>
            }
            confirmButton={
              <Button variant="red" onClick={handleConfirm}>
                {t('pages.manage-dapps.components.DisconnectBottomSheet.index.disconnect')}
              </Button>
            }
          />
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}
