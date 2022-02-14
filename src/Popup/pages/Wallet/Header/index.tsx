import { useState } from 'react';

import AccountButton from './AccountButton';
import AccountPopover from './AccountPopover';
import ChainPopover from './ChainPopover';
import NetworkPopover from './NetworkPopover';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

export default function WalletHeader() {
  const [chainPopoverAnchorEl, setChainPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenChainPopover = Boolean(chainPopoverAnchorEl);

  const [networkPopoverAnchorEl, setNetworkPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenNetworkPopover = Boolean(networkPopoverAnchorEl);

  const [accountPopoverAnchorEl, setAccountPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenAccountPopover = Boolean(accountPopoverAnchorEl);

  return (
    <Container>
      <LeftContentContainer>
        <AccountButton onClick={(event) => setAccountPopoverAnchorEl(event.currentTarget)} />
      </LeftContentContainer>
      <RightContentContainer>
        <NetworkButton onClick={(event) => setNetworkPopoverAnchorEl(event.currentTarget)} />
        <ChainButton onClick={(event) => setChainPopoverAnchorEl(event.currentTarget)} isActive={isOpenChainPopover} />
      </RightContentContainer>
      <ChainPopover
        marginThreshold={0}
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
      <AccountPopover
        marginThreshold={0}
        open={isOpenAccountPopover}
        onClose={() => setAccountPopoverAnchorEl(null)}
        anchorEl={accountPopoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      />
    </Container>
  );
}
