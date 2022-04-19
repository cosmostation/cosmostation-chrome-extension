import { Suspense, useEffect, useRef, useState } from 'react';
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

  const divRef = useRef<HTMLDivElement>(null);

  const [divHeight, setDivHeight] = useState(0);

  const listHeight = `calc(100% - ${divHeight / 10}rem - 1rem)`;

  const chainList = currentAllowedChains.map((chain) => ({ chain, amount: '0', isLoading: true }));

  const totalAmount = Object.values(dashboard).reduce((acc, cur) => plus(acc, cur), '0');

  useEffect(() => {
    setDivHeight(divRef.current?.clientHeight || 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <div ref={divRef}>
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
      </div>
      <ChainList data-height={listHeight}>
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
    </Container>
  );
}
