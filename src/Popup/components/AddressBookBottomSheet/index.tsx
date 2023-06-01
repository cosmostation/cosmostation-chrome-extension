import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import AddressBookItem from '~/Popup/components/AddressBookItem';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';
import type { AddressInfo } from '~/types/extensionStorage';

import { AddressList, Container, Header, HeaderTitle, StyledBottomSheet } from './styled';

type AddressBookBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickAddress?: (address: AddressInfo) => void;
  chain?: CosmosChain;
};

export default function AddressBookBottomSheet({ chain, onClickAddress, onClose, ...remainder }: AddressBookBottomSheetProps) {
  const { extensionStorage } = useExtensionStorage();
  const { currentChain } = useCurrentChain();
  const { t } = useTranslation();

  const { addressBook } = extensionStorage;
  const { navigate } = useNavigate();
  const filteredAddressBook = addressBook.filter((item) => (chain ? item.chainId === chain.id : item.chainId === currentChain.id));

  return (
    <StyledBottomSheet {...remainder} onClose={onClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{t('components.AddressBookBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <AddButton onClick={() => navigate('/setting/address-book/add')}>{t('components.AddressBookBottomSheet.index.addAddressButton')}</AddButton>
        </Header>
        <AddressList>
          {filteredAddressBook.map((item) => (
            <AddressBookItem
              key={item.id}
              addressInfo={item}
              onClick={(address) => {
                onClickAddress?.(address);
                onClose?.({}, 'backdropClick');
              }}
            />
          ))}
        </AddressList>
      </Container>
    </StyledBottomSheet>
  );
}
