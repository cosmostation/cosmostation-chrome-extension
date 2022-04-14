import { Typography } from '@mui/material';

import AddButton from '~/Popup/components/AddButton';
import AddressBookItem from '~/Popup/components/AddressBookItem';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { AddressInfo } from '~/types/chromeStorage';

import { AddressList, Container, Header, HeaderTitle, StyledBottomSheet } from './styled';

type AddressBookBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickAddress?: (address: AddressInfo) => void;
};

export default function AddressBookBottomSheet({ onClickAddress, onClose, ...remainder }: AddressBookBottomSheetProps) {
  const { chromeStorage } = useChromeStorage();
  const { currentChain } = useCurrentChain();

  const { t } = useTranslation();

  const { addressBook } = chromeStorage;
  const { navigate } = useNavigate();

  const filteredAddressBook = addressBook.filter((item) => item.chainId === currentChain.id);

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
