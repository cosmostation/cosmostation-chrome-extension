import { useEffect, useState } from 'react';
import { isMobile } from 'is-mobile';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getCurrent, openTab } from '~/Popup/utils/extensionTabs';
import { getCurrentWindow, updateWindow } from '~/Popup/utils/extensionWindows';

import { ButtonContainer, Container, DescriptionContainer } from './styled';

import Browser16Icon from '~/images/icons/Browser16.svg';

export default function LedgerToTab() {
  const [extensionWindow, setExtensionWindow] = useState<chrome.windows.Window | browser.windows.Window | undefined>();
  const [extensionTab, setExtensionTab] = useState<chrome.tabs.Tab | browser.tabs.Tab | undefined>();

  const { deQueue } = useCurrentQueue();

  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();

  useEffect(() => {
    void (async () => {
      setExtensionWindow(await getCurrentWindow());
      setExtensionTab(await getCurrent());
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    (extensionWindow?.type !== 'normal' || (extensionWindow?.type === 'normal' && !extensionTab)) &&
    !isMobile({ ua: window.navigator.userAgent, tablet: true }) &&
    currentAccount.type === 'LEDGER'
  ) {
    return (
      <Container>
        <DescriptionContainer>
          <Typography variant="h3">{t('components.Loading.LedgerToTab.index.description')}</Typography>
        </DescriptionContainer>
        <ButtonContainer>
          <Button
            Icon={Browser16Icon}
            type="button"
            typoVarient="h5"
            onClick={async () => {
              const tab = await openTab();

              if (extensionWindow?.type === 'popup' && tab?.windowId) {
                void updateWindow(tab?.windowId, { focused: true });
              }
            }}
          >
            {t('components.Loading.LedgerToTab.index.continue')}
          </Button>
        </ButtonContainer>
        <ButtonContainer>
          <Button
            type="button"
            typoVarient="h5"
            onClick={async () => {
              await deQueue();
            }}
          >
            {t('components.Loading.LedgerToTab.index.cancel')}
          </Button>
        </ButtonContainer>
      </Container>
    );
  }

  return null;
}
