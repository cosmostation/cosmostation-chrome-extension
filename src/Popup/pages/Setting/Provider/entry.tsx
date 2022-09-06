import keplrImg from '~/images/etc/keplr.png';
import metamaskImg from '~/images/etc/metamask.png';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

import Item from './components/Item';
import { Container, ListContainer } from './styled';

export default function Entry() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { providers } = chromeStorage;

  return (
    <Container>
      <ListContainer>
        <Item
          imageProps={{ alt: 'Metamask', src: metamaskImg }}
          switchProps={{
            checked: providers.metamask,
            onChange: (_, checked) => {
              void setChromeStorage('providers', { ...providers, metamask: checked });
            },
          }}
        >
          Metamask
        </Item>
        <Item
          imageProps={{ alt: 'Keplr', src: keplrImg }}
          switchProps={{
            checked: providers.keplr,
            onChange: (_, checked) => {
              void setChromeStorage('providers', { ...providers, keplr: checked });
            },
          }}
        >
          Keplr
        </Item>
      </ListContainer>
    </Container>
  );
}
