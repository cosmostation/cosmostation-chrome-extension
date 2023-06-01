import { TRANSPORT_TYPE } from '~/constants/ledger';
import SelectButton from '~/Popup/components/SelectButton';
import { useChromeStorage } from '~/Popup/hooks/useExtensionStorage';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { ledgerTransportType } = chromeStorage;

  const transportTypes = Object.values(TRANSPORT_TYPE);
  return (
    <Container>
      <ListContainer>
        {transportTypes.map((transportType) => (
          <SelectButton
            key={transportType}
            isActive={transportType === ledgerTransportType}
            onClick={() => setChromeStorage('ledgerTransportType', transportType)}
          >
            {transportType}
          </SelectButton>
        ))}
      </ListContainer>
    </Container>
  );
}
