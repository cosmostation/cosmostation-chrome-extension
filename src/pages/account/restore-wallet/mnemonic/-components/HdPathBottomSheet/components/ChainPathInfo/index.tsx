import BaseCoinImage from '@/components/common/BaseCoinImage';

import { ChainNameText, Container, DefaultHdPathText, HdPathAddressIndexText, LeftContainer, RightContainer, RightTextContainer } from './styled';

type ChainPathInfoProps = {
  chainName: string;
  chainImage: string;
  hdPath: string;
  currentHdPathIndex: string;
};

export default function ChainPathInfo({ chainName, chainImage, hdPath, currentHdPathIndex }: ChainPathInfoProps) {
  const path = hdPath.replace('${index}', ``);

  return (
    <Container>
      <LeftContainer>
        <BaseCoinImage imageURL={chainImage} />
        <ChainNameText variant="b2_M">{chainName}</ChainNameText>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <DefaultHdPathText variant="h5n_M">{path}</DefaultHdPathText>
          &nbsp;
          <HdPathAddressIndexText variant="h5n_M"> {currentHdPathIndex}</HdPathAddressIndexText>
        </RightTextContainer>
      </RightContainer>
    </Container>
  );
}
