import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRecoilValue } from 'recoil';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import Number from '~/Popup/components/common/Number';
import Header from '~/Popup/components/SelectSubHeader';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import EthereumChainItem, { EthereumChainItemError, EthereumChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/EthereumChainItem';
import TendermintChainItem, { TendermintChainItemError, TendermintChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/TendermintChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { plus } from '~/Popup/utils/big';
import type { Chain, EthereumChain, TendermintChain } from '~/types/chain';

import {
  ChainList,
  ChainListContainer,
  Container,
  CountContainer,
  CountLeftContainer,
  CountRightContainer,
  HeaderContainer,
  SubInfoContainer,
  TotalContainer,
  TotalValueContainer,
  TotalValueTextContainer,
} from './styled';

type ChainItem<T = Chain> = {
  chain: T;
  amount: string;
};

type ChainList<T = Chain> = ChainItem<T>[];

export default function Entry() {
  const { chromeStorage } = useChromeStorage();
  const { currentAllowedChains } = useCurrentAllowedChains();
  const { currentAccount } = useCurrentAccount();
  const dashboard = useRecoilValue(dashboardState);

  const { navigate } = useNavigate();

  const chainList: ChainList = currentAllowedChains.map((chain) => ({ chain, amount: '0' }));

  const totalAmount =
    typeof dashboard?.[currentAccount.id] === 'object' ? Object.values(dashboard[currentAccount.id]).reduce((acc, cur) => plus(acc, cur), '0') : '0';

  return (
    <Container>
      <HeaderContainer>
        <Header isShowChain={false} />
      </HeaderContainer>
      <TotalContainer>
        <TotalValueTextContainer>
          <Typography variant="h5">Total Value</Typography>
        </TotalValueTextContainer>
        <TotalValueContainer>
          <Number typoOfIntegers="h1n" typoOfDecimals="h2n" currency={chromeStorage.currency}>
            {totalAmount}
          </Number>
        </TotalValueContainer>
      </TotalContainer>
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
          {chainList.filter(isEthereum).map((item) => (
            <ErrorBoundary
              key={`${currentAccount.id}${item.chain.id}`}
              FallbackComponent={
                // eslint-disable-next-line react/no-unstable-nested-components
                (props) => <EthereumChainItemError {...props} chain={item.chain} />
              }
            >
              <Suspense fallback={<EthereumChainItemSkeleton chain={item.chain} />}>
                <EthereumChainItem key={item.chain.id} chain={item.chain} />
              </Suspense>
            </ErrorBoundary>
          ))}

          {chainList.filter(isTendermint).map((item) => (
            <ErrorBoundary
              key={`${currentAccount.id}${item.chain.id}`}
              FallbackComponent={
                // eslint-disable-next-line react/no-unstable-nested-components
                (props) => <TendermintChainItemError {...props} chain={item.chain} />
              }
            >
              <Suspense fallback={<TendermintChainItemSkeleton chain={item.chain} />}>
                <TendermintChainItem chain={item.chain} />
              </Suspense>
            </ErrorBoundary>
          ))}
        </ChainList>
      </ChainListContainer>
    </Container>
  );
}

function isTendermint(item: ChainItem): item is ChainItem<TendermintChain> {
  return item.chain.line === 'TENDERMINT';
}

function isEthereum(item: ChainItem): item is ChainItem<EthereumChain> {
  return item.chain.line === 'ETHEREUM';
}
