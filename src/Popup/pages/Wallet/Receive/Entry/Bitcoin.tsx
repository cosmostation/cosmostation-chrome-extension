import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import QRCode from 'qrcode.react';
import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { BitcoinChain } from '~/types/chain';

import {
  AddressContainer,
  ButtonContainer,
  Container,
  Panel,
  QRContainer,
  QRContentContainer,
  StyledIconButton,
  TitleAreaContainer,
  TitleContainer,
} from '../styled';

import Copy24Icon from '~/images/icons/Copy24.svg';
import ExplorerIcon from '~/images/icons/Explorer.svg';

type BitcoinProps = {
  chain: BitcoinChain;
};

export default function Bitcoin({ chain }: BitcoinProps) {
  const accounts = useAccounts(true);
  const { currentAccount } = useCurrentAccount();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const explorerAccountURL = useMemo(() => {
    if (!chain.explorerURL) {
      return '';
    }

    return `${chain.explorerURL}/address/${currentAddress}`;
  }, [chain.explorerURL, currentAddress]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.Receive.Entry.Bitcoin.copied'));
    }
  };
  return (
    <Container>
      <Panel>
        <TitleAreaContainer>
          <TitleContainer>
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Bitcoin.address')}</Typography>
          </TitleContainer>
          <ButtonContainer>
            {explorerAccountURL && (
              <StyledIconButton onClick={() => window.open(explorerAccountURL)}>
                <ExplorerIcon />
              </StyledIconButton>
            )}
            <StyledIconButton onClick={handleOnClickCopy}>
              <Copy24Icon />
            </StyledIconButton>
          </ButtonContainer>
        </TitleAreaContainer>
        <AddressContainer>
          <Typography variant="h5">{currentAddress}</Typography>
        </AddressContainer>
      </Panel>
      <Panel>
        <TitleAreaContainer>
          <TitleContainer>
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Bitcoin.scanQrCode')}</Typography>
          </TitleContainer>
          <ButtonContainer />
        </TitleAreaContainer>
        <QRContentContainer>
          <QRContainer>
            <QRCode value={currentAddress} size={164} />
          </QRContainer>
        </QRContentContainer>
      </Panel>
    </Container>
  );
}
