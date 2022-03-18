import Header from './components/Header';
import IbcTokenList from './components/IbcTokenList';
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
      <IbcTokenList />
    </Container>
  );
}
