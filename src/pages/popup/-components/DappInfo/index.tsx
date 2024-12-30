import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import ConnectedWebsiteImage from '@/components/ConnectedWebsiteImage';

import { Container, ContentsContainer, ContentsInfoContainer } from './styled';

type DappInfoProps = {
  image?: string;
  name?: string;
  url?: string;
};

export default function DappInfo({ image, name, url }: DappInfoProps) {
  return (
    <Container>
      <ContentsContainer>
        <ConnectedWebsiteImage image={image} />
        <ContentsInfoContainer>
          <Base1300Text variant="h2_B">{name}</Base1300Text>
          <Base1000Text variant="b3_R">{url}</Base1000Text>
        </ContentsInfoContainer>
      </ContentsContainer>
    </Container>
  );
}
