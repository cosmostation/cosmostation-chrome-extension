import SelectButton from '~/Popup/components/SelectButton';

import { Container, ListContainer } from './styled';

export default function Entry() {
  return (
    <Container>
      <ListContainer>
        <SelectButton>USD</SelectButton>
        <SelectButton>KRW</SelectButton>
        <SelectButton>EUR</SelectButton>
        <SelectButton>JPY</SelectButton>
        <SelectButton>CNY</SelectButton>
      </ListContainer>
    </Container>
  );
}
