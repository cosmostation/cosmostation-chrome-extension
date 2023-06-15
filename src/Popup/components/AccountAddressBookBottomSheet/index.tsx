import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CommonChain } from '~/types/chain';

import { AddressList, Container, Header, HeaderTitle, StyledBottomSheet } from './styled';
import AccountAddressBookItem from '../AccountAddressBookItem';

type AccountAddressBookBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickAddress?: (address: string) => void;
  chain?: CommonChain;
  hasCurrentAccount?: boolean;
};

export default function AccountAddressBookBottomSheet({
  hasCurrentAccount = true,
  chain,
  onClickAddress,
  onClose,
  ...remainder
}: AccountAddressBookBottomSheetProps) {
  const { extensionStorage } = useExtensionStorage();

  const { data } = useAccounts(true);

  const { currentAccount } = useCurrentAccount();
  const { accountName } = extensionStorage;

  const { t } = useTranslation();

  const filteredAccounts = useMemo(() => {
    const selectedAccount = data?.filter((item) => item.id === currentAccount.id) || [];
    const leftAccountsList = data?.filter((item) => item.id !== currentAccount.id) || [];
    return hasCurrentAccount ? [...selectedAccount, ...leftAccountsList] : leftAccountsList;
  }, [currentAccount, data, hasCurrentAccount]);

  return (
    <StyledBottomSheet {...remainder} onClose={onClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{t('components.AccountAddressBookBottomSheet.index.title')}</Typography>
          </HeaderTitle>
        </Header>
        <AddressList>
          {filteredAccounts.map((item) => (
            <AccountAddressBookItem
              key={item.id}
              accountName={accountName[item.id]}
              address={chain ? item.address[chain.id] : ''}
              accountId={item.id}
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
