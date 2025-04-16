import { useTranslation } from 'react-i18next';
import Lottie from 'react-lottie-player/dist/LottiePlayerLight';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import Header from '@/components/Header';
import { Route as Home } from '@/pages/index';

import {
  Container,
  ContentsContainer,
  HeaderContainer,
  HeaderLeftContainer,
  IconContainer,
  MessageContaienr,
  MessageText,
  Overlay,
  StyledBaseFooter,
  TitleText,
} from './styled';

import HomeIcon from '@/assets/images/icons/Home16.svg';
import ArrowBackIcon from '@/assets/images/icons/LeftArrow16.svg';

import animationData from '@/assets/animation/loading.json';

type TxProcessingOverlayProps = {
  title?: string;
  message?: string;
  open?: boolean;
};

export default function TxProcessingOverlay({ open = false, title, message }: TxProcessingOverlayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!open) {
    return null;
  }

  return (
    <Overlay>
      <HeaderContainer>
        <Header
          leftContent={
            <HeaderLeftContainer>
              <IconButton disabled>
                <IconContainer>
                  <ArrowBackIcon />
                </IconContainer>
              </IconButton>
              <IconButton
                disabled
                onClick={() => {
                  navigate({
                    to: Home.to,
                  });
                }}
              >
                <IconContainer>
                  <HomeIcon />
                </IconContainer>
              </IconButton>
            </HeaderLeftContainer>
          }
          middleContent={<Base1300Text variant="h4_B">{t('pages.wallet.send.$coinId.Entry.components.TxProcessingOverlay.header')}</Base1300Text>}
        />
      </HeaderContainer>

      <BaseBody>
        <Container>
          <ContentsContainer>
            <Lottie
              play
              style={{
                width: '8.2rem',
                height: '8.2rem',
              }}
              animationData={animationData}
              loop={true}
            />
            {(title || message) && (
              <>
                {title && <TitleText variant="b1_B">{title}</TitleText>}
                {message && (
                  <MessageContaienr>
                    <MessageText variant="b3_R_Multiline">{message}</MessageText>
                  </MessageContaienr>
                )}
              </>
            )}
          </ContentsContainer>
        </Container>
      </BaseBody>
      <StyledBaseFooter>
        <Button disabled>{t('pages.wallet.send.$coinId.Entry.components.TxProcessingOverlay.confirm')}</Button>
      </StyledBaseFooter>
    </Overlay>
  );
}
