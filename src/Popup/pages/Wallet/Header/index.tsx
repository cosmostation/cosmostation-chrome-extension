import { lazy, Suspense, useState } from 'react';

import { useCurrent } from '~/Popup/hooks/useCurrent';

import AccountButton from './AccountButton';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

const AccountPopover = lazy(() => import('./AccountPopover'));
const ChainPopover = lazy(() => import('./ChainPopover'));
const NetworkPopover = lazy(() => import('./NetworkPopover'));

export default function WalletHeader() {
  const { currentAccount, currentChain, currentNetwork } = useCurrent();

  const [popover, setPopover] = useState<'chain' | 'network' | 'account' | null>(null);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

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
      <Suspense fallback={null}>
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
      </Suspense>
      <Suspense fallback={null}>
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
      </Suspense>
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
