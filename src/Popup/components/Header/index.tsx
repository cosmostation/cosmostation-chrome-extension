import AccountButton from './AccountButton';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

import LogoIcon from '~/images/icons/Logo.svg';

export default function Header() {
  return (
    <Container>
      <LeftContentContainer>
        <LogoIcon />
      </LeftContentContainer>
      <RightContentContainer>
        <ChainButton />
        <NetworkButton />
        <AccountButton />
      </RightContentContainer>
    </Container>
  );
}
