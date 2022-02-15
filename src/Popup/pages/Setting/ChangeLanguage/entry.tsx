import SelectButton from '~/Popup/components/SelectButton';

import { Container, ListContainer } from './styled';

export default function Entry() {
  return (
    <Container>
      <ListContainer>
        <SelectButton>English</SelectButton>
        <SelectButton>한국어</SelectButton>
      </ListContainer>
    </Container>
  );
}
