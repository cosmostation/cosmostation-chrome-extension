import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';

import { AddressList, Container, Header, HeaderTitle, StyledBottomSheet } from './styled';
import MyAddressBookItem from '../MyAddressBookItem';

type MyAddressBookBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickAddress?: (address: string) => void;
  chain?: CosmosChain;
};

export default function MyAddressBookBottomSheet({ chain, onClickAddress, onClose, ...remainder }: MyAddressBookBottomSheetProps) {
  const accounts = useAccounts(true);
  const { currentAccount } = useCurrentAccount();

  const { t } = useTranslation();

  const myAccountAddress = accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain ? chain.id : ''] || '';

  return (
    <StyledBottomSheet {...remainder} onClose={onClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{t('components.MyAddressBookBottomSheet.index.title')}</Typography>
          </HeaderTitle>
        </Header>
        <AddressList>
          <MyAddressBookItem
            address={myAccountAddress}
            chainId={chain ? chain.id : ''}
            onClick={(address) => {
              onClickAddress?.(address);
              onClose?.({}, 'backdropClick');
            }}
          />
        </AddressList>
      </Container>
    </StyledBottomSheet>
  );
}
