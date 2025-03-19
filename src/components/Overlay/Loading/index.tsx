import Lottie from 'react-lottie-player/dist/LottiePlayerLight';

import { useLoadingOverlayStore } from '@/zustand/hooks/useLoadingOverlayStore';

import { Container, MessageContaienr, MessageText, TextContainer, TitleText } from './styled';
import Backdrop from '../components/Backdrop';

import animationData from '@/assets/animation/loading.json';

export default function LoadingOverlay() {
  const { loading, title, message } = useLoadingOverlayStore((state) => state);

  if (!loading) {
    return null;
  }

  return (
    <Backdrop>
      <Container>
        <Lottie
          play
          style={{
            width: '12rem',
            height: '12rem',
          }}
          animationData={animationData}
          loop={true}
        />
        {(title || message) && (
          <TextContainer>
            {title && <TitleText variant="b1_B">{title}</TitleText>}
            {message && (
              <MessageContaienr>
                <MessageText variant="b3_R_Multiline">{message}</MessageText>
              </MessageContaienr>
            )}
          </TextContainer>
        )}
      </Container>
    </Backdrop>
  );
}
