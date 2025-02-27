import { ChainImage, CoinImage, Container, LeftContainer, LeftSubContainer, RightContainer } from './styled';

type AssetContainerProps = {
  tokenimageURL?: string;
  chainImageURL?: string;
  leftHeaderComponent?: JSX.Element;
  leftSubHeaderComponent?: JSX.Element;
  rightHeaderComponent?: JSX.Element;
  rightSubHeaderComponent?: JSX.Element;
};

export default function AssetContainer({
  tokenimageURL,
  chainImageURL,
  leftHeaderComponent,
  leftSubHeaderComponent,
  rightHeaderComponent,
  rightSubHeaderComponent,
}: AssetContainerProps) {
  return (
    <Container>
      <LeftContainer>
        {tokenimageURL && <CoinImage imageURL={tokenimageURL} />}
        {chainImageURL && <ChainImage src={chainImageURL} />}
        <LeftSubContainer>
          {leftHeaderComponent}
          {leftSubHeaderComponent}
        </LeftSubContainer>
      </LeftContainer>
      <RightContainer>
        {rightHeaderComponent}
        {rightSubHeaderComponent}
      </RightContainer>
    </Container>
  );
}
