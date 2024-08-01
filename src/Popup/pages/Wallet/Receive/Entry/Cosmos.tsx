import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import QRCode from 'qrcode.react';
import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useBlockExplorerURLSWR } from '~/Popup/hooks/SWR/cosmos/useBlockExplorerURLSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';

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

type CosmosProps = {
  chain: CosmosChain;
};

export default function Cosmos({ chain }: CosmosProps) {
  const accounts = useAccounts(true);
  const { currentAccount } = useCurrentAccount();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const { getExplorerAccountURL } = useBlockExplorerURLSWR(chain);

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const explorerAccountURL = useMemo(() => getExplorerAccountURL(currentAddress), [currentAddress, getExplorerAccountURL]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.Receive.Entry.Cosmos.copied'));
    }
  };
  return (
    <Container>
      <Panel>
        <TitleAreaContainer>
          <TitleContainer>
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Cosmos.address')}</Typography>
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
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Cosmos.scanQrCode')}</Typography>
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
