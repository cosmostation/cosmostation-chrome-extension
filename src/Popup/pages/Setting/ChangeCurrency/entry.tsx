import { CURRENCY_TYPE } from '~/constants/chromeStorage';
import SelectButton from '~/Popup/components/SelectButton';
import { useChromeStorage } from '~/Popup/hooks/useExtensionStorage';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const currencyTypes = Object.values(CURRENCY_TYPE);
  return (
    <Container>
      <ListContainer>
        {currencyTypes.map((currencyType) => (
          <SelectButton key={currencyType} isActive={currencyType === chromeStorage.currency} onClick={() => setChromeStorage('currency', currencyType)}>
            {currencyType.toUpperCase()}
          </SelectButton>
        ))}
      </ListContainer>
    </Container>
  );
}
