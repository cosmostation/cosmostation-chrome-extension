import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { Body, ConfirmButton, Container, ContentsContainer, DescriptionText, Footer, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

type DeleteConfirmBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  contents: JSX.Element;
  descriptionText?: string;
  onClickConfirm: () => void;
};

export default function DeleteConfirmBottomSheet({ contents, descriptionText, onClose, onClickConfirm, ...remainder }: DeleteConfirmBottomSheetProps) {
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
            <Typography variant="h2_B">{t('components.DeleteConfirmBottomSheet.index.header')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'backdropClick');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <ContentsContainer>
            {contents}
            <DescriptionText variant="b3_R_Multiline">{descriptionText}</DescriptionText>
          </ContentsContainer>
        </Body>
        <Footer>
          <ConfirmButton variant="red" onClick={onClickConfirm}>
            {t('components.DeleteConfirmBottomSheet.index.delete')}
          </ConfirmButton>
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}
