import { useMemo } from 'react';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import QRCode from 'qrcode.react';
import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useParamsSWR } from '~/Popup/hooks/SWR/useParamsSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useTranslation } from '~/Popup/hooks/useTranslation';
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
  const { enqueueSnackbar } = useSnackbar();
  const { currentAccount } = useCurrentAccount();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const params = useParamsSWR(currentEthereumNetwork);

  const { t } = useTranslation();

  const { explorerURL } = currentEthereumNetwork;

  const currentAddress = accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '';

  const explorerAccountURL = useMemo(() => {
    const explorerAccountBaseURL = params.data?.params?.chainlist_params?.evm_explorer?.account || params.data?.params?.chainlist_params?.explorer?.account;

    if (explorerAccountBaseURL) {
      // eslint-disable-next-line no-template-curly-in-string
      return explorerAccountBaseURL.replace('${address}', currentAddress);
    }

    const explorerBaseURL = params.data?.params?.chainlist_params?.evm_explorer?.url || params.data?.params?.chainlist_params?.explorer?.url || explorerURL;

    if (explorerBaseURL) {
      return `${explorerBaseURL}/address/${currentAddress}`;
    }
    return '';
  }, [
    currentAddress,
    explorerURL,
    params.data?.params?.chainlist_params?.evm_explorer?.account,
    params.data?.params?.chainlist_params?.evm_explorer?.url,
    params.data?.params?.chainlist_params?.explorer?.account,
    params.data?.params?.chainlist_params?.explorer?.url,
  ]);

  const handleOnClickCopy = () => {
    if (copy(currentAddress)) {
      enqueueSnackbar(t('pages.Wallet.Receive.Entry.Ethereum.copied'));
    }
  };
  return (
    <Container>
      <Panel>
        <TitleAreaContainer>
          <TitleContainer>
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Ethereum.address')}</Typography>
          </TitleContainer>
          <ButtonContainer>
            {explorerAccountURL && (
              <StyledIconButton onClick={() => window.open(`${explorerAccountURL}/address/${currentAddress}`)}>
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
            <Typography variant="h6">{t('pages.Wallet.Receive.Entry.Ethereum.scanQrCode')}</Typography>
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
