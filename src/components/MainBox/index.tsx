import { BlurEffectLayer, BodyContainer, BottomContainer, CoinBackgroundImage, Container, ContentsContainer, TopContainer } from './styled';

import DefaultCoinImage from '@/assets/images/coin/defaultCoin.png';

type MainBoxProps = {
  top: JSX.Element;
  body: JSX.Element;
  bottom?: JSX.Element;
  className?: string;
  backgroundImage?: string;
  coinBackgroundImage?: string;
};

export default function MainBox({ top, body, bottom, className, backgroundImage, coinBackgroundImage }: MainBoxProps) {
  const coinImage = coinBackgroundImage || DefaultCoinImage;

  return (
    <Container className={className} backgroundImage={backgroundImage}>
      <CoinBackgroundImage backgroundImage={coinImage}>
        {coinImage && <BlurEffectLayer />}
        <ContentsContainer data-is-bottom={!!bottom}>
          <TopContainer>{top}</TopContainer>
          <BodyContainer>{body}</BodyContainer>
        </ContentsContainer>
        {bottom && <BottomContainer>{bottom}</BottomContainer>}
      </CoinBackgroundImage>
    </Container>
  );
}
