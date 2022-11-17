import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { CosmosChain } from '~/types/chain';

import { AddressList, Container, Header, HeaderTitle, StyledBottomSheet } from './styled';
import AccountAddressBookItem from '../AccountAddressBookItem';

type AccountAddressBookBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  onClickAddress?: (address: string) => void;
  chain?: CosmosChain;
  hasCurrentAccount?: boolean;
};

export default function AccountAddressBookBottomSheet({
  hasCurrentAccount = true,
  chain,
  onClickAddress,
  onClose,
  ...remainder
}: AccountAddressBookBottomSheetProps) {
  const { chromeStorage } = useChromeStorage();

  const { data } = useAccounts(true);

  const { currentAccount } = useCurrentAccount();
  const { accountName } = chromeStorage;

  const { t } = useTranslation();

  const filteredAccounts = useMemo(
    () => (hasCurrentAccount ? data : data?.filter((item) => item.id !== currentAccount.id)) || [],
    [currentAccount.id, data, hasCurrentAccount],
  );

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
              chain={chain}
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
