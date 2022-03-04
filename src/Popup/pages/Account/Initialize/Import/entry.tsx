import { useNavigate } from '~/Popup/hooks/useNavigate';
import IconButton from '~/Popup/pages/Account/Initialize/components/IconButton';

import { ButtonContainer, Container } from './styled';

import Key28Icon from '~/images/icons/Key28.svg';
import Mnemonic28Icon from '~/images/icons/Mnemonic28.svg';

export default function Entry() {
  const { navigate } = useNavigate();

  return (
    <Container>
      <ButtonContainer>
        <IconButton Icon={Mnemonic28Icon}>Restore with mnemonic</IconButton>
        <IconButton Icon={Key28Icon}>Restore with private key</IconButton>
      </ButtonContainer>
    </Container>
  );
}
