import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Account } from '~/types/extensionStorage';

import AccountItem from './components/AccountItem';
import DraggableAccountList from './components/DraggableAccountList';
import ManagePopover from './components/ManagePopover';
import { ButtonContainer, Container, ListContainer, SideButton, StyledButton } from './styled';

import ListEdit24Icon from '~/images/icons/ListEdit24.svg';

export type IndexedAccount = Account & { index: number };

export default function Entry() {
  const { extensionStorage } = useExtensionStorage();

  const { navigate, navigateBack } = useNavigate();

  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const [isEditMode, setIsEditMode] = useState(false);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { accounts, accountName } = extensionStorage;

  const { t } = useTranslation();

  if (isEditMode) {
    return (
      <Container>
        <DndProvider backend={HTML5Backend}>
          <DraggableAccountList
            accounts={accounts}
            accountName={accountName}
            onClose={() => {
              setIsEditMode(false);
            }}
          />
        </DndProvider>
      </Container>
    );
  }
  return (
    <Container>
      <SubSideHeader title={t('pages.Account.Management.layout.title')} onClick={() => navigateBack()}>
        <SideButton onClick={() => setIsEditMode(true)}>
          <ListEdit24Icon />
        </SideButton>
      </SubSideHeader>
      <ListContainer>
        {accounts.map((account) => (
          <AccountItem
            accountType={account.type}
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
