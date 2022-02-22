import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';
import SelectButton from '~/Popup/components/SelectButton';

import { ButtonContainer, Container, InputContainer, StyledInput48, StyledInput140 } from './styled';

export default function Entry() {
  return (
    <Container>
      <InputContainer>
        <StyledInput140
          multiline
          minRows={6}
          placeholder={'To restore your password,\nplease enter your Cosmostation Wallet\nrecovery code (or phrase).'}
          type="password"
        />
        <StyledInput48 type="password" placeholder="new password" />
        <StyledInput48 type="password" placeholder="new password confirmation" />
      </InputContainer>
      <ButtonContainer>
        <Button>Restore</Button>
      </ButtonContainer>
    </Container>
  );
}
