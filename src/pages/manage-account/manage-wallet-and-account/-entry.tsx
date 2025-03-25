import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import EmptyAsset from '@/components/EmptyAsset';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewSortedAccountStore } from '@/zustand/hooks/useNewSortedAccountStore';
import { useSwitchTapStore } from '@/zustand/hooks/useSwitchTabStore';

import DraggableMnemonicAccountList from './-components/DraggableMnemonicAccountList';
import DraggablePrivateKeyAccountList from './-components/DraggablePrivateKeyAccountList';
import { EmptyAssetContainer, StickyTabContainer, StyledTabPanel, TabPanelContentsContainer } from './-styled';

import ImportMnemonicIcon from '@/assets/images/icons/ImportMnemonic70.svg';
import ImportPrivateKeyIcon from '@/assets/images/icons/ImportPrivateKey70.svg';

export default function Entry() {
  const { t } = useTranslation();
  const { resetNewSortedAccount } = useNewSortedAccountStore((state) => state);
  const { manageAccountTapIndex, updatedManateAccountTabIndex } = useSwitchTapStore((state) => state);
  const { userAccounts } = useExtensionStorageStore((state) => state);

  const tabLabels = ['Mnenmonic', 'Private Key'];

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
          </StickyTabContainer>
          <StyledTabPanel value={manageAccountTapIndex} index={0}>
            <TabPanelContentsContainer>
              {uniqueMnemonicRestoreString.length > 0 ? (
                <DndProvider backend={HTML5Backend}>
                  <DraggableMnemonicAccountList uniqueMnemonicRestoreStrings={uniqueMnemonicRestoreString} />
                </DndProvider>
              ) : (
                <EmptyAssetContainer>
                  <EmptyAsset
                    icon={<ImportMnemonicIcon />}
                    title={t('pages.manage-account.manage-wallet-and-account.entry.importMnemonic')}
                    subTitle={t('pages.manage-account.manage-wallet-and-account.entry.importMnemonicDescription')}
                  />
                </EmptyAssetContainer>
              )}
            </TabPanelContentsContainer>
          </StyledTabPanel>
          <StyledTabPanel value={manageAccountTapIndex} index={1}>
            <TabPanelContentsContainer>
              {privateKeyAccountIds.length > 0 ? (
                <DndProvider backend={HTML5Backend}>
                  <DraggablePrivateKeyAccountList privateKeyAccountIds={privateKeyAccountIds} />
                </DndProvider>
              ) : (
                <EmptyAssetContainer>
                  <EmptyAsset
                    icon={<ImportPrivateKeyIcon />}
                    title={t('pages.manage-account.manage-wallet-and-account.entry.importPrivateKey')}
                    subTitle={t('pages.manage-account.manage-wallet-and-account.entry.importPrivateKeyDescription')}
                  />
                </EmptyAssetContainer>
              )}
            </TabPanelContentsContainer>
          </StyledTabPanel>
        </EdgeAligner>
      </BaseBody>
    </>
  );
}
