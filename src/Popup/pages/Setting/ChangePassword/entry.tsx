import Button from '~/Popup/components/common/Button';
import Divider from '~/Popup/components/common/Divider';
import Input from '~/Popup/components/common/Input';

import { ButtonContainer, Container, CurrentPasswordContainer, NewPasswordContainer, StyledForm } from './styled';

export default function Entry() {
  return (
    <Container>
      <StyledForm>
        <CurrentPasswordContainer>
          <Input type="password" placeholder="current password" />
        </CurrentPasswordContainer>
        <Divider />
        <NewPasswordContainer>
          <Input type="password" placeholder="new password" />
        </NewPasswordContainer>
        <Input type="password" placeholder="password confirmation" />
        <ButtonContainer>
          <Button>Confirm</Button>
        </ButtonContainer>
      </StyledForm>
    </Container>
  );
}
