import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseCoinImage from '@/components/common/BaseCoinImage';

import { ChainNameText, Container, LeftContainer, RightContainer, RightTextContainer } from './styled';

type ChainPathInfoProps = {
  chainName: string;
  fullHdPath: string;
  currentHdPathIndex: string;
  chainImage?: string;
};

export default function ChainPathInfo({ chainName, chainImage, fullHdPath, currentHdPathIndex }: ChainPathInfoProps) {
  const splitHdPath = fullHdPath.split('${index}');
  const head = splitHdPath[0].split('/').join(' / ');
  const tail = splitHdPath[1].split('/').join(' / ');

  return (
    <Container>
      <LeftContainer>
        <BaseCoinImage imageURL={chainImage} />
        <ChainNameText variant="b2_M">{chainName}</ChainNameText>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <Base1000Text variant="h5n_M">{head}</Base1000Text>
          &nbsp;
          <Base1300Text variant="h5n_M">{currentHdPathIndex}</Base1300Text>
          &nbsp;
          <Base1000Text variant="h5n_M">{tail}</Base1000Text>
        </RightTextContainer>
      </RightContainer>
    </Container>
  );
}
