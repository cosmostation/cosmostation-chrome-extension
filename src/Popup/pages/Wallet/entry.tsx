import Header from './Header';
import NativeChainCard from './NativeChainCard';
import { Container, HeaderContainer, NativeChainCardContainer } from './styled';

export default function Entry() {
  return (
    <Container>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <NativeChainCardContainer>
        <NativeChainCard />
      </NativeChainCardContainer>
    </Container>
  );
}
