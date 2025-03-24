import {
  CircleSkeletonContainer,
  Container,
  LeftContainer,
  LeftTextContainer,
  RightContainer,
  SmallTextSkeletonContainer,
  TextSkeletonContainer,
} from './styled';

export default function SkeletonCoinList() {
  return (
    <>
      <SkeletonCoinItem />
      <SkeletonCoinItem />
      <SkeletonCoinItem />
      <SkeletonCoinItem />
      <SkeletonCoinItem />
    </>
  );
}

export function SkeletonCoinItem() {
  return (
    <Container>
      <LeftContainer>
        <CircleSkeletonContainer variant="circular" />
        <LeftTextContainer>
          <TextSkeletonContainer variant="rectangular" />
          <SmallTextSkeletonContainer variant="rectangular" />
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <TextSkeletonContainer variant="rectangular" />
        <SmallTextSkeletonContainer variant="rectangular" />
      </RightContainer>
    </Container>
  );
}
