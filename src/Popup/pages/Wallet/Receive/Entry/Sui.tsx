import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import QRCode from 'qrcode.react';
import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { SuiChain } from '~/types/chain';

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

type SuiProps = {
  chain: SuiChain;
};

export default function Sui({ chain }: SuiProps) {
  const accounts = useAccounts(true);
  const { enqueueSnackbar } = useSnackbar();
  const { currentAccount } = useCurrentAccount();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  const { t } = useTranslation();

  const { explorerURL } = currentSuiNetwork;

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.Receive.Entry.Sui.copied'));
    }
  };
  return (
    <Container>
      <Panel>
        <TitleAreaContainer>
          <TitleContainer>
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Sui.address')}</Typography>
          </TitleContainer>
          <ButtonContainer>
            {explorerURL && (
              <StyledIconButton onClick={() => window.open(`${explorerURL}/account/${currentAddress}`)}>
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
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Sui.scanQrCode')}</Typography>
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
