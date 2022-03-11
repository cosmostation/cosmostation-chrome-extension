import { Suspense, useEffect, useState } from 'react';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';

import AccountButton from './AccountButton';
import AccountPopover from './AccountPopover';
import ChainPopover from './ChainPopover';
import NetworkPopover from './NetworkPopover';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

export default function WalletHeader() {
  const { currentAccount } = useCurrentAccount();
  const { currentChain } = useCurrentChain();
  const { currentNetwork } = useCurrentNetwork();

  const [loadPopover, setLoadPopover] = useState(false);

  const [popover, setPopover] = useState<'chain' | 'network' | 'account' | null>(null);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  useEffect(() => {
    setTimeout(() => {
      setLoadPopover(true);
    }, 200);
  }, []);

  return (
    <Container>
      <LeftContentContainer>
        <AccountButton
          onClick={(event) => {
            setPopover('account');
            setPopoverAnchorEl(event.currentTarget);
          }}
        >
          {currentAccount.name}
        </AccountButton>
      </LeftContentContainer>
      <RightContentContainer>
        {currentChain.line === 'ETHEREUM' && (
          <NetworkButton
            onClick={(event) => {
              setPopover('network');
              setPopoverAnchorEl(event.currentTarget);
            }}
          >
            {currentNetwork.networkName}
          </NetworkButton>
        )}
        <ChainButton
          imgSrc={currentChain.imageURL}
          onClick={(event) => {
            setPopover('chain');
            setPopoverAnchorEl(event.currentTarget);
          }}
          isActive={isOpenPopover && popover === 'chain'}
        >
          {currentChain.chainName}
        </ChainButton>
      </RightContentContainer>

      <ChainPopover
        marginThreshold={0}
        open={isOpenPopover && popover === 'chain'}
        onClose={() => setPopoverAnchorEl(null)}
        anchorEl={popoverAnchorEl}
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
        open={isOpenPopover && popover === 'network'}
        onClose={() => setPopoverAnchorEl(null)}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
      <Suspense fallback={null}>
        <AccountPopover
          marginThreshold={0}
          open={isOpenPopover && popover === 'account'}
          onClose={() => setPopoverAnchorEl(null)}
          anchorEl={popoverAnchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        />
      </Suspense>
    </Container>
  );
}
