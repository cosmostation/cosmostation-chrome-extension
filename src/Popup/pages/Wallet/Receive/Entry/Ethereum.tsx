import QRCode from 'qrcode.react';
import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import type { EthereumChain } from '~/types/chain';

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

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  const accounts = useAccounts(true);
  const { currentAccount } = useCurrentAccount();
  const { currentNetwork } = useCurrentEthereumNetwork();

  const { explorerURL } = currentNetwork;

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';
  return (
    <Container>
      <Panel>
        <TitleAreaContainer>
          <TitleContainer>
            <Typography variant="h6">Address</Typography>
          </TitleContainer>
          <ButtonContainer>
            {explorerURL && (
              <StyledIconButton onClick={() => window.open(`${explorerURL}/address/${currentAddress}`)}>
                <ExplorerIcon />
              </StyledIconButton>
            )}
            <StyledIconButton>
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
            <Typography variant="h6">Scan QR code</Typography>
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
