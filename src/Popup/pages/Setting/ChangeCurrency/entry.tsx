import { CURRENCY_TYPE } from '~/constants/extensionStorage';
import SelectButton from '~/Popup/components/SelectButton';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const currencyTypes = Object.values(CURRENCY_TYPE);
  return (
    <Container>
      <ListContainer>
        {currencyTypes.map((currencyType) => (
          <SelectButton key={currencyType} isActive={currencyType === extensionStorage.currency} onClick={() => setExtensionStorage('currency', currencyType)}>
            {currencyType.toUpperCase()}
          </SelectButton>
        ))}
      </ListContainer>
    </Container>
  );
}
