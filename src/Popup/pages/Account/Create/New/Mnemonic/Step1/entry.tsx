import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import { BottomContainer, Container } from './styled';

export default function Entry() {
  const { navigate } = useNavigate();
  return (
    <form>
      <Container>
        <BottomContainer>
          <Button>Next</Button>
        </BottomContainer>
      </Container>
    </form>
  );
}
