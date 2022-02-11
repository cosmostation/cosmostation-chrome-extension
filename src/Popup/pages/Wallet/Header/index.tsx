import { useState } from 'react';

import AccountButton from './AccountButton';
import ChainPopover from './ChainPopover';
import { ChainButton, Container, LeftContentContainer, NetworkButton, RightContentContainer } from './styled';

export default function WalletHeader() {
  const [chainPopoverAnchorEl, setChainPopoverAnchorElAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOnClickChainPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setChainPopoverAnchorElAnchorEl(event.currentTarget);
  };

  const handleOnCloseChainPopover = () => {
    setChainPopoverAnchorElAnchorEl(null);
  };

  const isOpenChainPopover = Boolean(chainPopoverAnchorEl);
  return (
    <Container>
      <LeftContentContainer>
        <AccountButton />
      </LeftContentContainer>
      <RightContentContainer>
        <NetworkButton />
        <ChainButton onClick={handleOnClickChainPopover} />
      </RightContentContainer>
      <ChainPopover
        open={isOpenChainPopover}
        onClose={handleOnCloseChainPopover}
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
    </Container>
  );
}
