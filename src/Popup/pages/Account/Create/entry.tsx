import MenuButton from '~/Popup/components/MenuButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { navigate } = useNavigate();
  return (
    <Container>
      <ListContainer>
        <MenuButton>Create a new account</MenuButton>
        <MenuButton>import mnemonic</MenuButton>
        <MenuButton>import private key</MenuButton>
      </ListContainer>
    </Container>
  );
}
