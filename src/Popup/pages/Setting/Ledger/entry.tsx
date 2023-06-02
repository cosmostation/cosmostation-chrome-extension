import { TRANSPORT_TYPE } from '~/constants/ledger';
import SelectButton from '~/Popup/components/SelectButton';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { ledgerTransportType } = extensionStorage;

  const transportTypes = Object.values(TRANSPORT_TYPE);
  return (
    <Container>
      <ListContainer>
        {transportTypes.map((transportType) => (
          <SelectButton
            key={transportType}
            isActive={transportType === ledgerTransportType}
            onClick={() => setExtensionStorage('ledgerTransportType', transportType)}
          >
            {transportType}
          </SelectButton>
        ))}
      </ListContainer>
    </Container>
  );
}
