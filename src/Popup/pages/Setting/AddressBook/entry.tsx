import { useState } from 'react';

import AddButton from '~/Popup/components/AddButton';
// import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import { Container, Header, StyledChainButton, StyledChainPopover } from './styled';

export default function Entry() {
  // const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { currentChain } = useCurrentChain();

  const [chain, setChain] = useState(currentChain);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  return (
    <Container>
      <Header>
        <StyledChainButton
          imgSrc={chain.imageURL}
          onClick={(event) => {
            setPopoverAnchorEl(event.currentTarget);
          }}
          isActive={isOpenPopover}
        >
          {chain.chainName}
        </StyledChainButton>
        <AddButton>Add address</AddButton>
      </Header>
      <StyledChainPopover
        marginThreshold={0}
        currentChain={currentChain}
        onClickChain={(clickedChain) => {
          setChain(clickedChain);
        }}
        open={isOpenPopover}
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
    </Container>
  );
}
