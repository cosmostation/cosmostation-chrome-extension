import { useState } from 'react';

import { useCurrent } from '~/Popup/hooks/useCurrent';

import AccountButton from './AccountButton';
import AccountPopover from './AccountPopover';
import ChainPopover from './ChainPopover';
import NetworkPopover from './NetworkPopover';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

export default function WalletHeader() {
  const { currentAccount, currentChain, currentNetwork } = useCurrent();

  const [chainPopoverAnchorEl, setChainPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenChainPopover = Boolean(chainPopoverAnchorEl);

  const [networkPopoverAnchorEl, setNetworkPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenNetworkPopover = Boolean(networkPopoverAnchorEl);

  const [accountPopoverAnchorEl, setAccountPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenAccountPopover = Boolean(accountPopoverAnchorEl);

  return (
    <Container>
      <LeftContentContainer>
        <AccountButton onClick={(event) => setAccountPopoverAnchorEl(event.currentTarget)}>{currentAccount.name}</AccountButton>
      </LeftContentContainer>
      <RightContentContainer>
        {currentChain.line === 'ETHEREUM' && (
          <NetworkButton onClick={(event) => setNetworkPopoverAnchorEl(event.currentTarget)}>{currentNetwork.networkName}</NetworkButton>
        )}
        <ChainButton imgSrc={currentChain.imageURL} onClick={(event) => setChainPopoverAnchorEl(event.currentTarget)} isActive={isOpenChainPopover}>
          {currentChain.chainName}
        </ChainButton>
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
