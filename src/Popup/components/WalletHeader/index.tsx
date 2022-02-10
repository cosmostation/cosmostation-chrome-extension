import AccountButton from './AccountButton';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

import LogoIcon from '~/images/icons/Logo.svg';

export default function Header() {
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
