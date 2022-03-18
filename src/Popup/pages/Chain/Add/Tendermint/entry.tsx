import MenuButton from '~/Popup/components/MenuButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { navigate } = useNavigate();
  return (
    <Container>
      <ListContainer>
        <MenuButton onClick={() => navigate('/chain/management/use', { isDuplicateCheck: true })}>Chain management</MenuButton>
        <MenuButton>Add Chain</MenuButton>
      </ListContainer>
    </Container>
  );
}
