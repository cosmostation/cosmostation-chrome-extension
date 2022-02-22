import { useState } from 'react';

import Popover from '~/Popup/components/common/Popover';
import { useCurrent } from '~/Popup/hooks/useCurrent';

import AccountButton from './AccountButton';
import AccountPopover from './AccountPopover';
import ChainPopover from './ChainPopover';
import NetworkPopover from './NetworkPopover';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

export default function WalletHeader() {
  const { currentAccount, currentChain, currentNetwork } = useCurrent();

  const [requestPopover, setRequestPopover] = useState<'chain' | 'network' | 'account' | null>(null);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const handleOnClosePopover = () => {
    setPopoverAnchorEl(null);

    setTimeout(() => {
      setRequestPopover(null);
    }, 500);
  };

  return (
    <Container>
      <LeftContentContainer>
        <AccountButton
          onClick={(event) => {
            setRequestPopover('account');
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
              setRequestPopover('network');
              setPopoverAnchorEl(event.currentTarget);
            }}
          >
            {currentNetwork.networkName}
          </NetworkButton>
        )}
        <ChainButton
          imgSrc={currentChain.imageURL}
          onClick={(event) => {
            setRequestPopover('chain');
            setPopoverAnchorEl(event.currentTarget);
          }}
          isActive={requestPopover === 'chain' && isOpenPopover}
        >
          {currentChain.chainName}
        </ChainButton>
      </RightContentContainer>

      <Popover
        marginThreshold={0}
        open={isOpenPopover}
        onClose={() => setPopoverAnchorEl(null)}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: requestPopover === 'account' ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: requestPopover === 'account' ? 'left' : 'right',
        }}
      >
        {requestPopover === 'account' && <AccountPopover onClose={handleOnClosePopover} />}
        {requestPopover === 'chain' && <ChainPopover onClose={handleOnClosePopover} />}
        {requestPopover === 'network' && <NetworkPopover onClose={handleOnClosePopover} />}
      </Popover>
    </Container>
  );
}
