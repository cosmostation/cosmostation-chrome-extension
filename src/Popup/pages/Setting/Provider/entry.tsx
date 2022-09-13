import { Typography } from '@mui/material';

import keplrImg from '~/images/etc/keplr.png';
import metamaskImg from '~/images/etc/metamask.png';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import Item from './components/Item';
import { BottomDescriptionContainer, BottomDescriptionInfoIconContainer, BottomDescriptionTextContainer, Container, ListContainer } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { t } = useTranslation();

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
      <BottomDescriptionContainer>
        <BottomDescriptionInfoIconContainer>
          <Info16Icon />
        </BottomDescriptionInfoIconContainer>
        <BottomDescriptionTextContainer>
          <Typography variant="h6">{t('pages.Setting.Provider.entry.description')}</Typography>
        </BottomDescriptionTextContainer>
      </BottomDescriptionContainer>
    </Container>
  );
}
