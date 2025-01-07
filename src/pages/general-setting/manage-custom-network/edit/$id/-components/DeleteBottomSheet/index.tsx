import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1000Text from '@/components/common/Base1000Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';

import { Body, Container, Footer, Header, HeaderTitle, StyledBottomSheet, TextContaienr } from './styled';

type DeleteBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickConfirm: () => void;
  onClickCancel?: () => void;
};

export default function DeleteBottomSheet({ onClickCancel, onClickConfirm, onClose, ...remainder }: DeleteBottomSheetProps) {
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
            <Typography variant="h2_B">{t('pages.general-setting.manage-custom-network.edit.$id.components.DeleteBottomSheet.index.title')}</Typography>
          </HeaderTitle>
        </Header>
        <Body>
          <TextContaienr>
            <Base1000Text variant="b3_R_Multiline">
              {t('pages.general-setting.manage-custom-network.edit.$id.components.DeleteBottomSheet.index.description')}
            </Base1000Text>
          </TextContaienr>
        </Body>
        <Footer>
          <SplitButtonsLayout
            cancelButton={
              <Button onClick={handleCancel} variant="dark">
                {t('pages.general-setting.manage-custom-network.edit.$id.components.DeleteBottomSheet.index.cancel')}
              </Button>
            }
            confirmButton={
              <Button variant="red" onClick={handleConfirm}>
                {t('pages.general-setting.manage-custom-network.edit.$id.components.DeleteBottomSheet.index.delete')}
              </Button>
            }
          />
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}
