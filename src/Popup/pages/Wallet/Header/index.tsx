import { useState } from 'react';

import AccountButton from './AccountButton';
import ChainPopover from './ChainPopover';
import NetworkPopover from './NetworkPopover';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

export default function WalletHeader() {
  const [chainPopoverAnchorEl, setChainPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenChainPopover = Boolean(chainPopoverAnchorEl);

  const [networkPopoverAnchorEl, setNetworkPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenNetworkPopover = Boolean(networkPopoverAnchorEl);

  return (
    <Container>
      <LeftContentContainer>
        <AccountButton />
      </LeftContentContainer>
      <RightContentContainer>
        <NetworkButton onClick={(event) => setNetworkPopoverAnchorEl(event.currentTarget)} />
        <ChainButton onClick={(event) => setChainPopoverAnchorEl(event.currentTarget)} isActive={isOpenChainPopover} />
      </RightContentContainer>
      <ChainPopover
        open={isOpenChainPopover}
        onClose={() => setChainPopoverAnchorEl(null)}
        anchorEl={chainPopoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
      <NetworkPopover
        open={isOpenNetworkPopover}
        onClose={() => setNetworkPopoverAnchorEl(null)}
        anchorEl={networkPopoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
    </Container>
  );
}
