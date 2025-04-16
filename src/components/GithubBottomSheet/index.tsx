import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Button from '@/components/common/Button';
import Image from '@/components/common/Image';

import { Body, Container, ContentsContainer, Footer, Header, HeaderTitle, ImageContainer, StyledBottomSheet, SubTitleText } from './styled';

import githubImage from '@/assets/images/logos/github.png';

type GithubBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  headerTitle: string;
  contentsSubTitle: string;
  onClickConfirm: () => void;
};

export default function GithubBottomSheet({ headerTitle, contentsSubTitle, onClickConfirm, onClose, ...remainder }: GithubBottomSheetProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onClickConfirm();
    onClose?.({}, 'backdropClick');
  };

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
            <Typography variant="h2_B">{headerTitle}</Typography>
          </HeaderTitle>
        </Header>
        <Body>
          <ContentsContainer>
            <ImageContainer>
              <Image src={githubImage} />
            </ImageContainer>
            <SubTitleText variant="b3_R_Multiline">{contentsSubTitle}</SubTitleText>
          </ContentsContainer>
        </Body>
        <Footer>
          <Button onClick={handleConfirm}>{t('components.GithubBottomSheet.index.goToGithub')}</Button>
        </Footer>
      </Container>
    </StyledBottomSheet>
  );
}
