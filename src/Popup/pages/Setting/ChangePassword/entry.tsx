import Divider from '~/Popup/components/common/Divider';
import Input from '~/Popup/components/common/Input';

import { Container, CurrentPasswordContainer, NewPasswordContainer } from './styled';

export default function Entry() {
  return (
    <Container>
      <form>
        <CurrentPasswordContainer>
          <Input type="password" placeholder="current password" />
        </CurrentPasswordContainer>
        <Divider />
        <NewPasswordContainer>
          <Input type="password" placeholder="new password" />
        </NewPasswordContainer>
        <Input type="password" placeholder="password confirmation" />
      </form>
    </Container>
  );
}
