import { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import Search from '@/components/Search';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewSortedAccountStore } from '@/zustand/hooks/useNewSortedAccountStore';
import { useSwitchTapStore } from '@/zustand/hooks/useSwitchTabStore';

import DraggableMnemonicAccountList from './-components/DraggableMnemonicAccountList';
import DraggablePrivateKeyAccountList from './-components/DraggablePrivateKeyAccountList';
import { SearchContainer, StickyTabContainer, StyledTabPanel, TabPanelContentsContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const { resetNewSortedAccount } = useNewSortedAccountStore((state) => state);
  const { manageAccountTapIndex, updatedManateAccountTabIndex } = useSwitchTapStore((state) => state);
  const { userAccounts } = useExtensionStorageStore((state) => state);

  const tabLabels = ['Mnenmonic', 'Private Key'];

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const searchText = useMemo(() => (!!search && debouncedSearch.length > 1 ? debouncedSearch : ''), [debouncedSearch, search]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    updatedManateAccountTabIndex(newTabValue);
  };

  const uniqueMnemonicRestoreString = userAccounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

  const privateKeyAccountIds = userAccounts.filter((item) => item.type === 'PRIVATE_KEY').map((account) => account.id);

  useEffect(() => {
    resetNewSortedAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <StickyTabContainer>
            <FilledTabs value={manageAccountTapIndex} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <FilledTab key={item} label={item} />
              ))}
            </FilledTabs>

            <SearchContainer>
              <Search
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                }}
                isPending={isDebouncing}
                placeholder={t('pages.manage-account.manage-wallet-and-account.entry.searchPlaceholder')}
                disableFilter
                onClear={() => {
                  setSearch('');
                  cancel();
                }}
              />
            </SearchContainer>
          </StickyTabContainer>
          <StyledTabPanel value={manageAccountTapIndex} index={0}>
            <TabPanelContentsContainer>
              <DndProvider backend={HTML5Backend}>
                <DraggableMnemonicAccountList uniqueMnemonicRestoreStrings={uniqueMnemonicRestoreString} search={searchText} />
              </DndProvider>
            </TabPanelContentsContainer>
          </StyledTabPanel>
          <StyledTabPanel value={manageAccountTapIndex} index={1}>
            <TabPanelContentsContainer>
              <DndProvider backend={HTML5Backend}>
                <DraggablePrivateKeyAccountList privateKeyAccountIds={privateKeyAccountIds} search={searchText} />
              </DndProvider>
            </TabPanelContentsContainer>
          </StyledTabPanel>
        </EdgeAligner>
      </BaseBody>
    </>
  );
}
