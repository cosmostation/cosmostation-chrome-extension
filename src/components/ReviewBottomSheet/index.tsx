import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Image from '@/components/common/Image';

import { Body, Container, ContentsContainer, Footer, Header, HeaderTitle, ImageContainer, StyledBottomSheet, SubTitleText, TitleText } from './styled';
import Button from '../common/Button';
import SplitButtonsLayout from '../common/SplitButtonsLayout';

import FinalReviewImage from '@/assets/images/etc/FinalReview.png';

type ReviewBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  image?: string;
  headerTitle?: string;
  contentsTitle?: string;
  contentsSubTitle?: string;
  cancleButtonText?: string;
  confirmButtonText?: string;
  onClickCancel: () => void;
  onClickConfirm: () => void;
};

export default function ReviewBottomSheet({
  image,
  headerTitle,
  contentsTitle,
  contentsSubTitle,
  cancleButtonText,
  confirmButtonText,
  onClickCancel,
  onClickConfirm,
  onClose,
  ...remainder
}: ReviewBottomSheetProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onClickConfirm();
    onClose?.({}, 'backdropClick');
  };

  const handleCancel = () => {
    onClickCancel();
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet {...remainder}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{headerTitle || t('components.FinalReviewBottomSheet.index.title')}</Typography>
          </HeaderTitle>
        </Header>
        <Body>
          <ContentsContainer>
            <ImageContainer>
              <Image src={image || FinalReviewImage} />
            </ImageContainer>
            {contentsTitle && <TitleText variant="b1_B">{contentsTitle}</TitleText>}
            {contentsSubTitle && <SubTitleText variant="b3_R_Multiline">{contentsSubTitle}</SubTitleText>}
          </ContentsContainer>
        </Body>
        <Footer>
          <SplitButtonsLayout
            cancelButton={
              <Button onClick={handleCancel} variant="dark">
                {cancleButtonText || t('components.FinalReviewBottomSheet.index.cancel')}
              </Button>
            }
            confirmButton={<Button onClick={handleConfirm}>{confirmButtonText || t('components.FinalReviewBottomSheet.index.confirm')}</Button>}
          />
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}
