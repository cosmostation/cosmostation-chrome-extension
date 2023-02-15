import { useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Account } from '~/types/chromeStorage';

import AccountItem from './components/AccountItem';
import AccountList from './components/AccountList';
import ManagePopover from './components/ManagePopover';
import { ButtonContainer, Container, StyledButton } from './styled';

export type IndexedAccount = Account & { index: number };

export default function Entry() {
  const { chromeStorage } = useChromeStorage();

  const { navigate } = useNavigate();

  const [selectedAccount, setSelectedAccount] = useState<Account>();

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpenPopover = Boolean(popoverAnchorEl);

  const { accounts, accountName } = chromeStorage;

  const [indexedAccounts, setIndexedAccounts] = useState<IndexedAccount[]>(
    accounts.map((item, idx) => ({
      index: idx,
      ...item,
    })),
  );
  const { t } = useTranslation();

  const findAccountItem = useCallback(
    (id: number) => {
      const cardItem = indexedAccounts.filter((c) => c.index === id)[0];

      return {
        cardItem,
        index: indexedAccounts.indexOf(cardItem),
      };
    },
    [indexedAccounts],
  );
  // TODO index필드 삭제 후 set하기
  // await setChromeStorage('accounts', {...);

  // const rebasedAccount = indexedAccounts.map(({ index, ...rest }) => ({
  //   ...rest,
  // }));

  const moveAccountItem = useCallback(
    (id: number, atIndex: number) => {
      const { cardItem, index } = findAccountItem(id);
      setIndexedAccounts(
        update(indexedAccounts, {
          $splice: [
            [index, 1],
            [atIndex, 0, cardItem],
          ],
        }),
      );
    },
    [indexedAccounts, findAccountItem],
  );

  return (
    <Container>
      <DndProvider backend={HTML5Backend}>
        <AccountList>
          <>
            {indexedAccounts.map((account) => (
              <AccountItem
                draggableItem={account}
                moveAccountItem={moveAccountItem}
                findAccountItem={findAccountItem}
                accountType={account.type}
                isActive={selectedAccount?.id === account.id && isOpenPopover}
                key={account.id}
                itemIndex={account.index}
                onClick={(event) => {
                  setSelectedAccount(account);
                  setPopoverAnchorEl(event.currentTarget);
                }}
              >
                {accountName[account.id]}
              </AccountItem>
            ))}
          </>
        </AccountList>
      </DndProvider>
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
