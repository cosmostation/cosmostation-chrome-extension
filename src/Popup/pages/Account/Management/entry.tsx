import { useState } from 'react';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Account } from '~/types/chromeStorage';

import AccountItem from './components/AccountItem';
import ManagePopover from './components/ManagePopover';
import { ButtonContainer, Container, ListContainer, StyledButton } from './styled';

export default function Entry() {
  const { chromeStorage } = useChromeStorage();

  const { navigate } = useNavigate();

  const [selectedAccount, setSelectedAccount] = useState<Account>();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { accounts, accountName } = chromeStorage;

  const { t } = useTranslation();
  return (
    <Container>
      <ListContainer>
        {accounts.map((account) => (
          <AccountItem
            isActive={selectedAccount?.id === account.id && isOpenPopover}
            key={account.id}
            onClick={(event) => {
              setSelectedAccount(account);
              setPopoverAnchorEl(event.currentTarget);
            }}
          >
            {accountName[account.id]}
          </AccountItem>
        ))}
      </ListContainer>
      <ButtonContainer>
        <StyledButton onClick={() => navigate('/account/create')}>{t('pages.Account.Management.entry.addAccount')}</StyledButton>
      </ButtonContainer>
      <ManagePopover
        account={selectedAccount}
        marginThreshold={0}
        open={isOpenPopover}
        onClose={() => {
          setPopoverAnchorEl(null);
        }}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
    </Container>
  );
}
