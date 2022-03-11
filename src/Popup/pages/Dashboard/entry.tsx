import { Suspense, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRecoilValue } from 'recoil';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { Container as Overlay } from '~/Popup/components/Loading/Overlay/styled';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import ChainItem from '~/Popup/pages/Dashboard/components/ChainItem';
import CosmosChainItem, { CosmosChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/CosmosChainItem';
import EthereumChainItem, { EthereumChainItemSkeleton } from '~/Popup/pages/Dashboard/components/ChainItem/EthereumChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';
import { plus } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

import { ChainList, Container, CountContainer, CountLeftContainer, CountRightContainer, TotalValueContainer, TotalValueTextContainer } from './styled';

export default function Entry() {
  const { chromeStorage } = useChromeStorage();
  const { currentAllowedChains } = useCurrentAllowedChains();
  const dashboard = useRecoilValue(dashboardState);

  const divRef = useRef<HTMLDivElement>(null);

  const [divHeight, setDivHeight] = useState(0);

  const listHeight = `calc(100% - ${divHeight / 10}rem)`;

  const chainList = currentAllowedChains.map((chain) => ({ chain, amount: '0', isLoading: true }));

  const totalAmount = Object.values(dashboard).reduce((acc, cur) => plus(acc, cur), '0');

  useEffect(() => {
    setDivHeight(divRef.current?.clientHeight || 0);

    console.log('dd');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => console.log(dashboard), [dashboard]);

  return (
    <Container>
      <div ref={divRef}>
        <TotalValueTextContainer>
          <Typography variant="h5">Total Value</Typography>
        </TotalValueTextContainer>
        <TotalValueContainer>
          <Number typoOfIntegers="h1n" typoOfDecimals="h2n" currency={chromeStorage.currency} fixed={2}>
            {totalAmount}
          </Number>
        </TotalValueContainer>
        <CountContainer>
          <CountLeftContainer>
            <Typography variant="h6">Chain</Typography>
          </CountLeftContainer>
          <CountRightContainer>
            <Typography variant="h6">{chainList.length}</Typography>
          </CountRightContainer>
        </CountContainer>
      </div>
      <ChainList data-height={listHeight}>
        {chainList.map((item) =>
          item.chain.line === 'COSMOS' ? (
            <ErrorBoundary key={item.chain.id} fallback={<CosmosChainItemSkeleton chain={item.chain} />}>
              <Suspense fallback={<CosmosChainItemSkeleton chain={item.chain} />}>
                <CosmosChainItem chain={item.chain} />
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
    </Container>
  );
}
