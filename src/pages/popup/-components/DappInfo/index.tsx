import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import ConnectedWebsiteImage from '@/components/ConnectedWebsiteImage';

import { Container, ContentsContainer, ContentsInfoContainer, EllipsisContainer } from './styled';

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
          <EllipsisContainer>
            <Base1300Text variant="h2_B">{name}</Base1300Text>
          </EllipsisContainer>
          <EllipsisContainer>
            <Base1000Text variant="b3_R">{url}</Base1000Text>
          </EllipsisContainer>
        </ContentsInfoContainer>
      </ContentsContainer>
    </Container>
  );
}
