import { useState } from 'react';

import AddButton from '~/Popup/components/AddButton';
import AddressBookItem from '~/Popup/components/AddressBookItem';
// import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';

import { AddressBookList, Container, Header, StyledChainButton, StyledChainPopover } from './styled';

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
      <AddressBookList>
        <AddressBookItem
          addressInfo={{
            address: 'ewgewgwegew',
            chainId: '62a8e13a-3107-40ef-ade4-58de45aa6c1f',
            id: '62a8e13a-3107-40ef-ade4-58de45aa6c1a',
            label: 'wegwegewg,',
            memo: 'ewoigheowigh',
          }}
        />
      </AddressBookList>
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
