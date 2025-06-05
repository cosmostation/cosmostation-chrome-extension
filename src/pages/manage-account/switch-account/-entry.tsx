import { useEffect, useMemo, useState } from 'react';
import { t } from 'i18next';
import { useDebounce } from 'use-debounce';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import Search from '@/components/Search';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useSwitchTapStore } from '@/zustand/hooks/useSwitchTabStore';

import MnemonicAccount from './-components/MnemonicAccount';
import PrivateKeyAccount from './-components/PrivateKeyAccount';
import { SearchContainer, StickyTabContainer, StyledTabPanel, TabPanelContentsContainer } from './-styled';

export default function Entry() {
  const { manageAccountTapIndex, updatedManateAccountTabIndex } = useSwitchTapStore((state) => state);
  const { currentAccount } = useCurrentAccount();

  const isMnemonicAccount = currentAccount.type === 'MNEMONIC';
  const tabLabels = ['Mnenmonic', 'Private Key'];

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const searchText = useMemo(() => (!!search && debouncedSearch.length > 1 ? debouncedSearch : ''), [debouncedSearch, search]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    updatedManateAccountTabIndex(newTabValue);
  };

  useEffect(() => {
    if (isMnemonicAccount) {
      updatedManateAccountTabIndex(0);
    } else {
      updatedManateAccountTabIndex(1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
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
              placeholder={t('pages.manage-account.switch-account.entry.searchPlaceholder')}
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
            <MnemonicAccount search={searchText} />
          </TabPanelContentsContainer>
        </StyledTabPanel>
        <StyledTabPanel value={manageAccountTapIndex} index={1}>
          <TabPanelContentsContainer>
            <PrivateKeyAccount search={searchText} />
          </TabPanelContentsContainer>
        </StyledTabPanel>
      </EdgeAligner>
    </BaseBody>
  );
}
