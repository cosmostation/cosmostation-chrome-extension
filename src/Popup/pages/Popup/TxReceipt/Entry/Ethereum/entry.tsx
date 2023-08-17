import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import OutlineButton from '~/Popup/components/common/OutlineButton';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { EthereumChain } from '~/types/chain';

import { BottomContainer, Container, HeaderTitle, StyledIconButton } from './styled';

import ExplorerIcon from '~/images/icons/Explorer.svg';

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  const { navigate } = useNavigate();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const params = useParams();

  const txHash = useMemo(() => params.id || '', [params.id]);
  // https://suiexplorer.com/txblock/9GBTjxLhE1zQCpWG4qVrzqruGbARy7nRepnpTEk5kRwz?network=mainnet
  // https://aptoscan.com/version/226665159
  const explorerURL = useMemo(() => currentEthereumNetwork.explorerURL, [currentEthereumNetwork.explorerURL]);

  const txDetailExplorerURL = useMemo(() => (explorerURL ? `${explorerURL}/tx/${txHash}` : ''), [explorerURL, txHash]);

  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts();
  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  return (
    <Container>
      <PopupHeader account={{ ...currentAccount, address: currentAddress }} chain={{ name: chain.chainName, imageURL: chain.imageURL }} />
      {txDetailExplorerURL && (
        <StyledIconButton onClick={() => window.open(txDetailExplorerURL)}>
          <ExplorerIcon />
        </StyledIconButton>
      )}
      <HeaderTitle>
        <Typography variant="h4">Success</Typography>
      </HeaderTitle>

      <BottomContainer>
        <OutlineButton
          onClick={() => {
            navigate('/');
          }}
        >
          {t('pages.Popup.Cosmos.Sign.Amino.entry.cancelButton')}
        </OutlineButton>
      </BottomContainer>
    </Container>
  );
}
