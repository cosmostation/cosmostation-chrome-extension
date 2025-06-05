import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Typography } from '@mui/material';

import type { UniqueChainId } from '@/types/chain';

import AddressBookItem from './components/AddressBook';
import MyAddress from './components/MyAddress';
import { Body, Container, Header, HeaderTitle, SearchContainer, StyledBottomSheet, StyledButton, StyledTabPanel, TabPanelContentsContainer } from './styled';
import { FilledTab, FilledTabs } from '../common/FilledTab';
import Search from '../Search';

import Close24Icon from 'assets/images/icons/Close24.svg';

type AddressBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chainId: UniqueChainId;
  filterAddress?: string;
  headerTitle?: string;
  onClickAddress?: (address: string, memo?: string) => void;
};

export default function AddressBottomSheet({ chainId, headerTitle, filterAddress, onClose, onClickAddress, ...remainder }: AddressBottomSheetProps) {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = [t('components.AddressBottomSheet.index.myAddress'), t('components.AddressBottomSheet.index.addressBook')];

  const [search, setSearch] = useState('');
  const [debouncedSearch, { cancel, isPending }] = useDebounce(search, 300);

  const isDebouncing = !!search && isPending();

  const searchText = useMemo(() => (!!search && debouncedSearch.length > 1 ? debouncedSearch : ''), [debouncedSearch, search]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const onHandleClick = (address: string, memo?: string) => {
    onClickAddress?.(address, memo);
    onClose?.({}, 'backdropClick');
  };

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <Typography variant="h2_B">{headerTitle || t('components.AddressBottomSheet.index.title')}</Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
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
            disableFilter
            placeholder={t('components.AddressBottomSheet.index.searchPlaceholder')}
            onClear={() => {
              setSearch('');
              cancel();
            }}
          />
        </SearchContainer>
        <Body>
          <StyledTabPanel value={tabValue} index={0} data-is-active={tabValue === 0}>
            <TabPanelContentsContainer>
              <MyAddress
                chainId={chainId}
                filterAddress={filterAddress}
                onClickAddress={(address) => {
                  onHandleClick(address);
                }}
                searchText={searchText}
              />
            </TabPanelContentsContainer>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1} data-is-active={tabValue === 1}>
            <TabPanelContentsContainer>
              <AddressBookItem
                chainId={chainId}
                searchText={searchText}
                onClickAddress={(address, memo) => {
                  onHandleClick(address, memo);
                }}
              />
            </TabPanelContentsContainer>
          </StyledTabPanel>
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
