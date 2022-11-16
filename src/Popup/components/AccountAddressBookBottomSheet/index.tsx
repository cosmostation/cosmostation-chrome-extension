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
  isIBCSend?: boolean;
};

export default function AccountAddressBookBottomSheet({ isIBCSend, chain, onClickAddress, onClose, ...remainder }: AccountAddressBookBottomSheetProps) {
  const { chromeStorage } = useChromeStorage();

  const { data } = useAccounts(true);

  const { currentAccount } = useCurrentAccount();
  const { accountName } = chromeStorage;

  const { t } = useTranslation();

  return (
    <StyledBottomSheet {...remainder} onClose={onClose}>
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h4">{t('components.MyAddressBookBottomSheet.index.title')}</Typography>
          </HeaderTitle>
        </Header>
        <AddressList>
          {data
            ?.filter((item) => isIBCSend ?? item.id !== currentAccount.id)
            .map((item) => (
              <AccountAddressBookItem
                accountName={accountName[item.id]}
                address={item.address[chain ? chain.id : '']}
                chainId={chain ? chain.id : ''}
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
