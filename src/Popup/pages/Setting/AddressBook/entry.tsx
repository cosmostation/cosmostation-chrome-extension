import { useState } from 'react';
import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import AddressBookItem from '~/Popup/components/AddressBookItem';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Path } from '~/types/route';

import {
  AddAddressBookButton,
  AddAddressBookImage,
  AddAddressBookText,
  AddressBookList,
  Container,
  Header,
  StyledChainButton,
  StyledChainPopover,
} from './styled';

import Plus16Icon from '~/images/icons/Plus16.svg';

export default function Entry() {
  const { extensionStorage } = useExtensionStorage();
  const { currentChain } = useCurrentChain();
  const { currentAdditionalChains } = useCurrentAdditionalChains();

  const { addressBook } = extensionStorage;

  const [isCustom, setIsCustom] = useState(!!currentAdditionalChains.find((item) => item.id === currentChain.id));

  const { t } = useTranslation();

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
          isCustom={isCustom}
        >
          {chain.chainName}
        </StyledChainButton>
        {filteredAddressBook.length > 0 && (
          <AddButton onClick={() => navigate(`/setting/address-book/add/${chain.id}` as unknown as Path)}>
            {t('pages.Setting.AddressBook.entry.addAddressButton')}
          </AddButton>
        )}
      </Header>
      <AddressBookList>
        {filteredAddressBook.length === 0 && (
          <AddAddressBookButton onClick={() => navigate(`/setting/address-book/add/${chain.id}` as unknown as Path)} type="button">
            <AddAddressBookImage>
              <Plus16Icon />
            </AddAddressBookImage>
            <AddAddressBookText>
              <Typography variant="h5">{t('pages.Setting.AddressBook.entry.addAddressButton')}</Typography>
            </AddAddressBookText>
          </AddAddressBookButton>
        )}
        {filteredAddressBook.map((item) => (
          <AddressBookItem key={item.id} addressInfo={item} />
        ))}
      </AddressBookList>
      <StyledChainPopover
        isOnlyChain
        marginThreshold={0}
        currentChain={chain}
        onClickChain={(clickedChain, clickedIsCustom) => {
          setChain(clickedChain);
          setIsCustom(!!clickedIsCustom);
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
