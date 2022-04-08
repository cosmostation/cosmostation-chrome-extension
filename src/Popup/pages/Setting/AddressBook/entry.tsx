import { useState } from 'react';

import AddButton from '~/Popup/components/AddButton';
import AddressBookItem from '~/Popup/components/AddressBookItem';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useNavigate } from '~/Popup/hooks/useNavigate';

import { AddressBookList, Container, Header, StyledChainButton, StyledChainPopover } from './styled';

export default function Entry() {
  const { chromeStorage } = useChromeStorage();
  const { currentChain } = useCurrentChain();

  const { addressBook } = chromeStorage;

  const [chain, setChain] = useState(currentChain);

  const { navigate } = useNavigate();

  const filteredAddressBook = addressBook.filter((item) => item.chainId === chain.id);

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
        <AddButton onClick={() => navigate('/setting/address-book/add')}>Add address</AddButton>
      </Header>
      <AddressBookList>
        {filteredAddressBook.map((item) => (
          <AddressBookItem key={item.id} addressInfo={item} />
        ))}
      </AddressBookList>
      <StyledChainPopover
        marginThreshold={0}
        currentChain={chain}
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
