import Lottie from 'react-lottie-player/dist/LottiePlayerLight';

import { Container, LottieContainer, SubTitleText, TextContainer, TitleText } from './styled';

import listLoadingAnimationData from '@/assets/animation/list-loading.json';

type EmptyAssetProps = {
  title: string;
  subTitle: string;
};

export default function ListLoading({ title, subTitle }: EmptyAssetProps) {
  return (
    <Container>
      <LottieContainer>
        <Lottie
          play
          style={{
            width: '7rem',
            height: '7rem',
          }}
          animationData={listLoadingAnimationData}
          loop={true}
        />
      </LottieContainer>
      <TextContainer>
        <TitleText variant="b2_M">{title}</TitleText>
        <SubTitleText variant="b3_R_Multiline">{subTitle}</SubTitleText>
      </TextContainer>
    </Container>
  );
}
