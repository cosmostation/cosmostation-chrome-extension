import { useEffect } from 'react';
import { useResetRecoilState } from 'recoil';

import MenuButton from '~/Popup/components/MenuButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { newAccountState } from '~/Popup/recoils/newAccount';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { navigate } = useNavigate();

  const resetNewAccount = useResetRecoilState(newAccountState);

  useEffect(() => {
    resetNewAccount();
  }, [resetNewAccount]);
  return (
    <Container>
      <ListContainer>
        <MenuButton onClick={() => navigate('/account/create/new/mnemonic/step1')}>Create a new account</MenuButton>
        <MenuButton onClick={() => navigate('/account/create/import/mnemonic')}>import mnemonic</MenuButton>
        <MenuButton onClick={() => navigate('/account/create/import/private-key')}>import private key</MenuButton>
      </ListContainer>
    </Container>
  );
}
