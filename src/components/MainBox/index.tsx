import { BlurEffectLayer, BodyContainer, BottomContainer, CoinBackgroundImage, Container, ContentsContainer, TopContainer } from './styled';

type MainBoxProps = {
  top: JSX.Element;
  body: JSX.Element;
  bottom?: JSX.Element;
  className?: string;
  bgImageClassName?: 'basic' | 'stake' | 'coinDetail' | 'coinOverView';
  backgroundImage?: string;
  coinBackgroundImage?: string;
};

export default function MainBox({ top, body, bottom, className, bgImageClassName = 'basic', backgroundImage, coinBackgroundImage }: MainBoxProps) {
  return (
    <Container className={className} backgroundImage={backgroundImage}>
      <CoinBackgroundImage className={bgImageClassName} backgroundImage={coinBackgroundImage}>
        {coinBackgroundImage && <BlurEffectLayer />}
        <ContentsContainer data-is-bottom={!!bottom}>
          <TopContainer>{top}</TopContainer>
          <BodyContainer>{body}</BodyContainer>
        </ContentsContainer>
        {bottom && <BottomContainer>{bottom}</BottomContainer>}
      </CoinBackgroundImage>
    </Container>
  );
}
