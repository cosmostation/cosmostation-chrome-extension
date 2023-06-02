import { Typography } from '@mui/material';

import aptosImg from '~/images/etc/aptos.png';
import keplrImg from '~/images/etc/keplr.png';
import metamaskImg from '~/images/etc/metamask.png';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import Item from './components/Item';
import { BottomDescriptionContainer, BottomDescriptionInfoIconContainer, BottomDescriptionTextContainer, Container, ListContainer } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

export default function Entry() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { t } = useTranslation();

  const { providers } = extensionStorage;

  return (
    <Container>
      <ListContainer>
        <Item
          imageProps={{ alt: 'Metamask', src: metamaskImg }}
          switchProps={{
            checked: providers.metamask,
            onChange: (_, checked) => {
              void setExtensionStorage('providers', { ...providers, metamask: checked });
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
              void setExtensionStorage('providers', { ...providers, keplr: checked });
            },
          }}
        >
          Keplr
        </Item>

        <Item
          imageProps={{ alt: 'Aptos', src: aptosImg }}
          switchProps={{
            checked: providers.aptos,
            onChange: (_, checked) => {
              void setExtensionStorage('providers', { ...providers, aptos: checked });
            },
          }}
        >
          Aptos
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
