import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import type { UniqueChainId } from '@/types/chain';

import AddressBookItem from './components/AddressBook';
import MyAddress from './components/MyAddress';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledTabPanel, TabPanelContentsContainer } from './styled';
import { FilledTab, FilledTabs } from '../common/FilledTab';

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
        <Body>
          <StyledTabPanel value={tabValue} index={0}>
            <TabPanelContentsContainer>
              <MyAddress
                chainId={chainId}
                filterAddress={filterAddress}
                onClickAddress={(address) => {
                  onHandleClick(address);
                }}
              />
            </TabPanelContentsContainer>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <TabPanelContentsContainer>
              <AddressBookItem
                chainId={chainId}
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
