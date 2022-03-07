import { useEffect } from 'react';
import { useResetRecoilState } from 'recoil';

import { useNavigate } from '~/Popup/hooks/useNavigate';
import IconButton from '~/Popup/pages/Account/Initialize/components/IconButton';
import { newMnemonicAccountState, newPrivateKeyAccountState } from '~/Popup/recoils/newAccount';

import { ButtonContainer, Container } from './styled';

import Key28Icon from '~/images/icons/Key28.svg';
import Mnemonic28Icon from '~/images/icons/Mnemonic28.svg';

export default function Entry() {
  const { navigate } = useNavigate();

  const resetNewMnemonicAccount = useResetRecoilState(newMnemonicAccountState);
  const resetNewPrivateKeyAccount = useResetRecoilState(newPrivateKeyAccountState);

  useEffect(() => {
    resetNewMnemonicAccount();
    resetNewPrivateKeyAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <ButtonContainer>
        <IconButton Icon={Mnemonic28Icon} onClick={() => navigate('/account/initialize/import/mnemonic')}>
          Restore with mnemonic
        </IconButton>
        <IconButton Icon={Key28Icon} onClick={() => navigate('/account/initialize/import/private-key')}>
          Restore with private key
        </IconButton>
      </ButtonContainer>
    </Container>
  );
}
