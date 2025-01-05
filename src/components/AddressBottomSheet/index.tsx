import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import type { UniqueChainId } from '@/types/chain';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import AddressBookItem from './components/AddressBook';
import MnemonicAccount from './components/MnemonicAccount';
import { Body, Container, Header, HeaderTitle, StyledBottomSheet, StyledButton, StyledTabPanel, TabPanelContentsContainer } from './styled';
import { FilledTab, FilledTabs } from '../common/FilledTab';

import Close24Icon from 'assets/images/icons/Close24.svg';

type AddressBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chainId: UniqueChainId;
  headerTitle?: string;
  onClickAddress?: (address: string, memo?: string) => void;
};

export default function AddressBottomSheet({ chainId, headerTitle, onClose, onClickAddress, ...remainder }: AddressBottomSheetProps) {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = [t('components.AddressBottomSheet.index.myAddress'), t('components.AddressBottomSheet.index.addressBook')];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const { accounts } = useExtensionStorageStore((state) => state);

  const uniqueMnemonicRestoreString = accounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

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
              {uniqueMnemonicRestoreString.map((item, i) => (
                <MnemonicAccount
                  key={i}
                  mnemonicRestoreString={item}
                  chainId={chainId}
                  onClickAddress={(address) => {
                    onHandleClick(address);
                  }}
                />
              ))}
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
