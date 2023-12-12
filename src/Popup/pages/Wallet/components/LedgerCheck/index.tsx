import { Typography } from '@mui/material';

import { LEDGER_SUPPORT_COIN_TYPE } from '~/constants/ledger';
import Button from '~/Popup/components/common/Button';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { debouncedOpenTab } from '~/Popup/utils/extensionTabs';

import { ButtonContainer, Container, LedgerConnectIcon, LedgerWarningIcon, TextContainer } from './styled';

import Browser16Icon from '~/images/icons/Browser16.svg';

type LedgerCheckProps = {
  children: JSX.Element;
};

export default function LedgerCheck({ children }: LedgerCheckProps) {
  const { currentChain } = useCurrentChain();
  const { currentAccount } = useCurrentAccount();
  const { enQueue } = useCurrentQueue();

  const { t } = useTranslation();

  const handleOnClickConnect = async () => {
    if (currentChain.line === 'COSMOS') {
      await enQueue({
        messageId: '',
        origin: '',
        channel: 'inApp',
        message: {
          method: 'cos_requestAccount',
          params: {
            chainName: currentChain.chainName,
          },
        },
      });
    }

    if (currentChain.line === 'ETHEREUM') {
      await enQueue({
        messageId: '',
        origin: '',
        channel: 'inApp',
        message: {
          method: 'eth_requestAccounts',
          params: [],
        },
      });
    }

    if (currentChain.line === 'SUI') {
      await enQueue({
        messageId: '',
        origin: '',
        channel: 'inApp',
        message: {
          method: 'sui_connect',
          params: [],
        },
      });
    }

    await debouncedOpenTab();
  };

  if (currentAccount.type === 'LEDGER') {
    if (
      (![LEDGER_SUPPORT_COIN_TYPE.COSMOS, LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC, LEDGER_SUPPORT_COIN_TYPE.CRONOS_POS].includes(currentChain.bip44.coinType) &&
        currentChain.line === 'COSMOS') ||
      currentChain.line === 'APTOS'
    ) {
      return (
        <Container>
          <LedgerWarningIcon />
          <TextContainer sx={{ margin: '1.2rem 0 0.8rem' }}>
            <Typography variant="h4">{t('pages.Wallet.components.LedgerCheck.index.notSupportedTitle')}</Typography>
          </TextContainer>
          <TextContainer sx={{ margin: '0.8rem 0 1.5rem' }}>
            <Typography variant="h6">{t('pages.Wallet.components.LedgerCheck.index.notSupportedDescription')}</Typography>
          </TextContainer>
        </Container>
      );
    }

    if (
      (!currentAccount.cosmosPublicKey && currentChain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.COSMOS && currentChain.line === 'COSMOS') ||
      (!currentAccount.mediblocPublicKey && currentChain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.MEDIBLOC && currentChain.line === 'COSMOS') ||
      (!currentAccount.cryptoOrgPublicKey && currentChain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.CRONOS_POS && currentChain.line === 'COSMOS') ||
      (!currentAccount.ethereumPublicKey && currentChain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.ETHEREUM && currentChain.line === 'ETHEREUM') ||
      (!currentAccount.suiPublicKey && currentChain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.SUI && currentChain.line === 'SUI')
    ) {
      return (
        <Container>
          <LedgerConnectIcon />
          <TextContainer sx={{ margin: '0.8rem 0 1.5rem' }}>
            <Typography variant="h6">{t('pages.Wallet.components.LedgerCheck.index.connectDescription')}</Typography>
          </TextContainer>
          <ButtonContainer>
            <Button Icon={Browser16Icon} type="button" typoVarient="h5" onClick={handleOnClickConnect}>
              {t('pages.Wallet.components.LedgerCheck.index.connect')}
            </Button>
          </ButtonContainer>
        </Container>
      );
    }
  }

  return children;
}
