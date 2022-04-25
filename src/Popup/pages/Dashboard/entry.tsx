import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRecoilValue } from 'recoil';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import Number from '~/Popup/components/common/Number';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import EthereumChainItem, { EthereumChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/EthereumChainItem';
import TendermintChainItem, { TendermintChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/TendermintChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { plus } from '~/Popup/utils/big';

import {
  ChainList,
  ChainListContainer,
  Container,
  CountContainer,
  CountLeftContainer,
  CountRightContainer,
  SubInfoContainer,
  TotalValueContainer,
  TotalValueTextContainer,
} from './styled';

export default function Entry() {
  const { chromeStorage } = useChromeStorage();
  const { currentAllowedChains } = useCurrentAllowedChains();
  const dashboard = useRecoilValue(dashboardState);

  const { navigate } = useNavigate();

  const chainList = currentAllowedChains.map((chain) => ({ chain, amount: '0', isLoading: true }));

  const totalAmount = Object.values(dashboard).reduce((acc, cur) => plus(acc, cur), '0');

  return (
    <Container>
      <TotalValueTextContainer>
        <Typography variant="h5">Total Value</Typography>
      </TotalValueTextContainer>
      <TotalValueContainer>
        <Number typoOfIntegers="h1n" typoOfDecimals="h2n" currency={chromeStorage.currency}>
          {totalAmount}
        </Number>
      </TotalValueContainer>
      <SubInfoContainer>
        <CountContainer>
          <CountLeftContainer>
            <Typography variant="h6">Chain</Typography>
          </CountLeftContainer>
          <CountRightContainer>
            <Typography variant="h6">{chainList.length}</Typography>
          </CountRightContainer>
        </CountContainer>
        <AddButton onClick={() => navigate('/chain/management/use')}>Add chain</AddButton>
      </SubInfoContainer>
      <ChainListContainer>
        <ChainList>
          {chainList.map((item) =>
            item.chain.line === 'TENDERMINT' ? (
              <ErrorBoundary key={item.chain.id} fallback={<TendermintChainItemSkeleton chain={item.chain} />}>
                <Suspense fallback={<TendermintChainItemSkeleton chain={item.chain} />}>
                  <TendermintChainItem chain={item.chain} />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <ErrorBoundary key={item.chain.id} fallback={<EthereumChainItemSkeleton chain={item.chain} />}>
                <Suspense fallback={<EthereumChainItemSkeleton chain={item.chain} />}>
                  <EthereumChainItem key={item.chain.id} chain={item.chain} />
                </Suspense>
              </ErrorBoundary>
            ),
          )}
        </ChainList>
      </ChainListContainer>
    </Container>
  );
}
