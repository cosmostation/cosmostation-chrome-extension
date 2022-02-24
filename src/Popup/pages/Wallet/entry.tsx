import Header from './components/Header';
import NativeChainCard from './components/NativeChainCard';
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
