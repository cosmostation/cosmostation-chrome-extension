import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { getCurrent, openTab } from '~/Popup/utils/chromeTabs';
import { getCurrentWindow } from '~/Popup/utils/chromeWindows';

import { ButtonContainer, Container, DescriptionContainer } from './styled';

import Browser16Icon from '~/images/icons/Browser16.svg';

export default function LedgerToTab() {
  const [chromeWindow, setChromeWindow] = useState<chrome.windows.Window | undefined>();
  const [chromeTab, setChromeTab] = useState<chrome.tabs.Tab | undefined>();

  const { deQueue } = useCurrentQueue();

  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();

  useEffect(() => {
    void (async () => {
      setChromeWindow(await getCurrentWindow());
      setChromeTab(await getCurrent());
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if ((chromeWindow?.type !== 'normal' || (chromeWindow?.type === 'normal' && !chromeTab)) && currentAccount.type === 'LEDGER') {
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
              await openTab();
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
