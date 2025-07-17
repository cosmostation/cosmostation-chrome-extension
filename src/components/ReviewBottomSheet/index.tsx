import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';

import Image from '@/components/common/Image';

import {
  Body,
  Container,
  ContentsContainer,
  Footer,
  Header,
  HeaderTitle,
  ImageContainer,
  JsonIconContainer,
  StyledBottomSheet,
  StyledOutlinedChipButton,
  SubTitleText,
  TitleText,
  TitleTextContainer,
} from './styled';
import Base1300Text from '../common/Base1300Text';
import Button from '../common/Button';
import SplitButtonsLayout from '../common/SplitButtonsLayout';
import JsonDialog from '../JsonDialog';

import JSONIcon from '@/assets/images/icons/JSON16.svg';

import finalReviewImage from '@/assets/images/etc/finalReview.png';

type ReviewBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  image?: string;
  headerTitle?: string;
  contentsTitle?: string;
  contentsSubTitle?: string;
  cancleButtonText?: string;
  confirmButtonText?: string;
  rawTxString?: string | null;
  onClickCancel?: () => void;
  onClickConfirm: () => void;
};

export default function ReviewBottomSheet({
  image,
  headerTitle,
  contentsTitle,
  contentsSubTitle,
  cancleButtonText,
  confirmButtonText,
  rawTxString,
  onClickCancel,
  onClickConfirm,
  onClose,
  ...remainder
}: ReviewBottomSheetProps) {
  const { t } = useTranslation();

  const [isOpenDialog, setisOpenDialog] = useState(false);

  const handleConfirm = () => {
    onClickConfirm();
    onClose?.({}, 'backdropClick');
  };

  const handleCancel = () => {
    onClickCancel?.();
    onClose?.({}, 'backdropClick');
  };

  const handleClosePopover = () => {
    setisOpenDialog(false);
  };
  return (
    <>
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
                <Image src={image || finalReviewImage} />
              </ImageContainer>
              {contentsTitle && (
                <TitleTextContainer>
                  <TitleText variant="b1_B">{contentsTitle}</TitleText>
                </TitleTextContainer>
              )}
              {contentsSubTitle && <SubTitleText variant="b3_R_Multiline">{contentsSubTitle}</SubTitleText>}
              {rawTxString && (
                <StyledOutlinedChipButton
                  onClick={() => {
                    setisOpenDialog(true);
                  }}
                >
                  <JsonIconContainer>
                    <JSONIcon />
                  </JsonIconContainer>
                  <Base1300Text variant="b3_M">{t('components.FinalReviewBottomSheet.index.viewDetails')}</Base1300Text>
                </StyledOutlinedChipButton>
              )}
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
      {rawTxString && (
        <JsonDialog
          jsonString={rawTxString}
          open={isOpenDialog}
          onClose={handleClosePopover}
          title={t('components.FinalReviewBottomSheet.index.jsonDialogTitle')}
        />
      )}
    </>
  );
}
