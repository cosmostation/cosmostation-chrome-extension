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
import { useCurrentShownEthereumNetworks } from '~/Popup/hooks/useCurrent/useCurrentShownEthereumNetworks';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import CosmosChainItem, { CosmosChainItemError, CosmosChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/CosmosChainItem';
import EthereumChainItem, { EthereumChainItemError, EthereumChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/EthereumChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { plus } from '~/Popup/utils/big';
import type { Chain, CosmosChain, EthereumChain } from '~/types/chain';

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
  const { currentShownEthereumNetwork } = useCurrentShownEthereumNetworks();
  const dashboard = useRecoilValue(dashboardState);

  const { navigate } = useNavigate();

  const chainList: ChainList = currentAllowedChains.map((chain) => ({ chain, amount: '0' }));

  const cosmosChainList = chainList.filter(isCosmos);
  const ethereumChainList = chainList.filter(isEthereum);

  const cosmosChainNames = cosmosChainList.map((item) => item.chain.chainName);
  const ethereumNetworkList =
    ethereumChainList.length > 0 ? currentShownEthereumNetwork.filter((network) => !cosmosChainNames.includes(network.networkName)) : [];

  const chainCnt = cosmosChainList.length + ethereumNetworkList.length;

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
            <Typography variant="h6">{chainCnt}</Typography>
          </CountRightContainer>
        </CountContainer>
        <AddButton onClick={() => navigate('/chain/management/use')}>Add chain</AddButton>
      </SubInfoContainer>
      <ChainListContainer>
        <ChainList>
          {ethereumChainList.map((item) =>
            ethereumNetworkList.map((network) => (
              <ErrorBoundary
                key={`${currentAccount.id}${item.chain.id}${network.id}`}
                FallbackComponent={
                  // eslint-disable-next-line react/no-unstable-nested-components
                  (props) => <EthereumChainItemError {...props} chain={item.chain} network={network} />
                }
              >
                <Suspense fallback={<EthereumChainItemSkeleton chain={item.chain} network={network} />}>
                  <EthereumChainItem key={item.chain.id} chain={item.chain} network={network} />
                </Suspense>
              </ErrorBoundary>
            )),
          )}

          {cosmosChainList.map((item) => (
            <ErrorBoundary
              key={`${currentAccount.id}${item.chain.id}`}
              FallbackComponent={
                // eslint-disable-next-line react/no-unstable-nested-components
                (props) => <CosmosChainItemError {...props} chain={item.chain} />
              }
            >
              <Suspense fallback={<CosmosChainItemSkeleton chain={item.chain} />}>
                <CosmosChainItem chain={item.chain} />
              </Suspense>
            </ErrorBoundary>
          ))}
        </ChainList>
      </ChainListContainer>
    </Container>
  );
}

function isCosmos(item: ChainItem): item is ChainItem<CosmosChain> {
  return item.chain.line === 'COSMOS';
}

function isEthereum(item: ChainItem): item is ChainItem<EthereumChain> {
  return item.chain.line === 'ETHEREUM';
}
