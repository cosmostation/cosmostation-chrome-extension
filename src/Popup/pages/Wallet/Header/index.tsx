import AccountButton from './AccountButton';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

export default function WalletHeader() {
  return (
    <Container>
      <LeftContentContainer>
        <AccountButton />
      </LeftContentContainer>
      <RightContentContainer>
        <NetworkButton />
        <ChainButton />
      </RightContentContainer>
    </Container>
  );
}
