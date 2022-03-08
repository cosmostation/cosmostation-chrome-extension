import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAllowedChains } from '~/Popup/hooks/useCurrent/useCurrentAllowedChains';
import CosmosChainItem from '~/Popup/pages/Dashboard/components/ChainItem/CosmosChainItem';
import EthereumChainItem from '~/Popup/pages/Dashboard/components/ChainItem/EthereumChainItem';
import { dashboardState } from '~/Popup/recoils/dashboard';

import { ChainList, Container, CountContainer, CountLeftContainer, CountRightContainer, TotalValueContainer, TotalValueTextContainer } from './styled';

export default function Entry() {
  const { chromeStorage } = useChromeStorage();
  const { currentAllowedChains } = useCurrentAllowedChains();
  const [dashboard, setDashboard] = useRecoilState(dashboardState);

  const divRef = useRef<HTMLDivElement>(null);

  const [divHeight, setDivHeight] = useState(0);

  const listHeight = `calc(100% - ${divHeight / 10}rem)`;

  useEffect(() => {
    void setDashboard(currentAllowedChains.map((chain) => ({ chain, amount: '0', price: '0', cap: '0' })));
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
            105.00
          </Number>
        </TotalValueContainer>
        <CountContainer>
          <CountLeftContainer>
            <Typography variant="h6">Chain</Typography>
          </CountLeftContainer>
          <CountRightContainer>
            <Typography variant="h6">{dashboard.length}</Typography>
          </CountRightContainer>
        </CountContainer>
      </div>
      <ChainList data-height={listHeight}>
        {dashboard.map((item) =>
          item.chain.line === 'COSMOS' ? (
            <CosmosChainItem key={item.chain.id} chain={item.chain} />
          ) : (
            <EthereumChainItem key={item.chain.id} chain={item.chain} />
          ),
        )}
      </ChainList>
    </Container>
  );
}
